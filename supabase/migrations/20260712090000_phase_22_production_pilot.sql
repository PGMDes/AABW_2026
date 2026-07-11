-- Phase 22 production pilot backend extension.

alter table public.tasks
    add column version bigint not null default 1,
    add column archived_at timestamptz null,
    add column selected_execution_option_id uuid null,
    add column selected_execution_option_snapshot jsonb null;

alter table public.tasks drop constraint tasks_workflow_status_check;
alter table public.tasks add constraint tasks_workflow_status_check check (
    workflow_status in (
        'draft', 'analyzed', 'approved', 'launched', 'completed', 'archived',
        'submitted', 'recommended', 'needs_human_review', 'approval_required',
        'approved_for_launch', 'blocked'
    )
);
alter table public.tasks add constraint tasks_archive_shape_check check (
    (workflow_status = 'archived' and archived_at is not null)
    or (workflow_status <> 'archived' and archived_at is null)
);

create or replace function public.enforce_task_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.workflow_status = old.workflow_status then
        return new;
    end if;

    if old.workflow_status not in ('draft', 'analyzed', 'approved', 'launched', 'completed', 'archived')
        or new.workflow_status not in ('draft', 'analyzed', 'approved', 'launched', 'completed', 'archived') then
        return new;
    end if;

    if not (
        (old.workflow_status = 'draft' and new.workflow_status = 'analyzed')
        or (old.workflow_status = 'analyzed' and new.workflow_status in ('draft', 'approved'))
        or (old.workflow_status = 'approved' and new.workflow_status in ('draft', 'launched'))
        or (old.workflow_status = 'launched' and new.workflow_status = 'completed')
        or (old.workflow_status in ('draft', 'analyzed', 'approved', 'completed') and new.workflow_status = 'archived')
        or (old.workflow_status = 'archived' and new.workflow_status = 'draft')
    ) then
        raise check_violation using message = format('invalid task lifecycle transition: %s -> %s', old.workflow_status, new.workflow_status);
    end if;

    new.version = old.version + 1;
    new.updated_at = now();
    return new;
end;
$$;

create trigger tasks_enforce_lifecycle
before update of workflow_status on public.tasks
for each row execute function public.enforce_task_lifecycle();

alter table public.agent_runs
    add column attempt_number integer not null default 1,
    add column request_id uuid not null default gen_random_uuid();
alter table public.agent_runs add constraint agent_runs_attempt_number_check check (attempt_number between 1 and 3);

create table public.task_attachments (
    id uuid primary key default gen_random_uuid(),
    task_id text not null,
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    file_name text not null,
    storage_path text not null unique,
    mime_type text not null,
    byte_size bigint not null,
    extracted_text text not null,
    extracted_character_count integer not null,
    sensitivity_status text not null,
    created_at timestamptz not null default now(),
    constraint task_attachments_task_owner_fkey foreign key (task_id, owner_user_id)
        references public.tasks(id, owner_user_id) on delete cascade,
    constraint task_attachments_mime_check check (mime_type in ('text/plain', 'text/markdown')),
    constraint task_attachments_size_check check (byte_size between 1 and 1048576),
    constraint task_attachments_character_count_check check (extracted_character_count between 0 and 100000),
    constraint task_attachments_sensitivity_check check (sensitivity_status in ('allowed', 'blocked_high_sensitivity'))
);
create index task_attachments_task_id_idx on public.task_attachments(task_id);

create table public.idempotency_keys (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    operation text not null,
    idempotency_key text not null,
    request_hash text not null,
    response_status integer not null,
    response_body jsonb not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null default (now() + interval '24 hours'),
    unique(owner_user_id, operation, idempotency_key)
);

create table public.execution_options (
    id uuid primary key default gen_random_uuid(),
    option_key text not null,
    version integer not null,
    display_name text not null,
    route text not null,
    description text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    unique(option_key, version),
    constraint execution_options_route_check check (route in ('human', 'agent', 'hybrid')),
    constraint execution_options_version_check check (version > 0)
);

insert into public.execution_options (option_key, version, display_name, route, description) values
    ('human_specialist', 1, 'Human specialist', 'human', 'Human-led execution for sensitive or judgment-heavy work.'),
    ('governed_agent_draft', 1, 'Governed AI draft', 'agent', 'OpenAI produces a bounded draft for approved low-sensitivity work.'),
    ('hybrid_review', 1, 'AI draft + Human review', 'hybrid', 'AI drafts and a Human remains responsible for final acceptance.');

create table public.executions (
    id uuid primary key default gen_random_uuid(),
    task_id text not null,
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    execution_option_id uuid not null references public.execution_options(id),
    option_snapshot jsonb not null,
    status text not null,
    estimated_minutes integer null,
    actual_minutes integer null,
    satisfaction_score integer null,
    outcome_summary text null,
    lessons_learned text null,
    launched_at timestamptz not null default now(),
    completed_at timestamptz null,
    constraint executions_task_owner_fkey foreign key (task_id, owner_user_id)
        references public.tasks(id, owner_user_id) on delete cascade,
    constraint executions_status_check check (status in ('launched', 'completed', 'failed', 'cancelled')),
    constraint executions_satisfaction_check check (satisfaction_score between 1 and 5),
    constraint executions_time_check check (coalesce(estimated_minutes, 0) >= 0 and coalesce(actual_minutes, 0) >= 0),
    constraint executions_completion_shape_check check (
        (status = 'launched' and completed_at is null)
        or (status in ('completed', 'failed', 'cancelled') and completed_at is not null)
    )
);
create unique index executions_one_per_task_idx on public.executions(task_id);

alter table public.tasks
    add constraint tasks_selected_execution_option_fkey foreign key (selected_execution_option_id)
        references public.execution_options(id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('task-attachments', 'task-attachments', false, 1048576, array['text/plain', 'text/markdown'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.task_attachments enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.execution_options enable row level security;
alter table public.executions enable row level security;

create policy task_attachments_owner_select on public.task_attachments for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy idempotency_keys_owner_select on public.idempotency_keys for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy execution_options_authenticated_select on public.execution_options for select to authenticated using (is_active);
create policy executions_owner_select on public.executions for select to authenticated using ((select auth.uid()) = owner_user_id);

grant select on public.task_attachments, public.idempotency_keys, public.execution_options, public.executions to authenticated;
revoke insert, update, delete, truncate, references, trigger on public.task_attachments, public.idempotency_keys, public.execution_options, public.executions from authenticated, anon;

-- Phase 22 production pilot correction R1: invariants and command helpers.
alter table public.tasks add column lifecycle_contract text not null default 'legacy';
alter table public.tasks add constraint tasks_lifecycle_contract_check check (lifecycle_contract in ('legacy', 'phase22'));
alter table public.tasks add constraint tasks_phase22_status_check check (lifecycle_contract <> 'phase22' or workflow_status in ('draft', 'analyzed', 'approved', 'launched', 'completed', 'archived'));
alter table public.agent_runs alter column attempt_number drop not null;
alter table public.agent_runs alter column attempt_number drop default;
create unique index agent_runs_task_attempt_number_key on public.agent_runs (task_id, attempt_number) where attempt_number is not null;
alter table public.idempotency_keys add column state text not null default 'completed', add column resource_id text null, alter column response_status drop not null, alter column response_body set default '{}'::jsonb;
alter table public.idempotency_keys add constraint idempotency_keys_state_check check (state in ('in_progress', 'completed'));

drop trigger tasks_enforce_lifecycle on public.tasks;
drop function public.enforce_task_lifecycle();
create function public.phase22_manage_task_update() returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare meaningful boolean;
begin
  if new.version is distinct from old.version then raise check_violation using message = 'tasks.version is database managed'; end if;
  meaningful := row(new.title,new.description,new.expected_output,new.deadline,new.audience,new.sensitivity,new.urgency,new.budget_range,new.workflow_status,new.archived_at,new.selected_execution_option_id,new.selected_execution_option_snapshot) is distinct from row(old.title,old.description,old.expected_output,old.deadline,old.audience,old.sensitivity,old.urgency,old.budget_range,old.workflow_status,old.archived_at,old.selected_execution_option_id,old.selected_execution_option_snapshot);
  if not meaningful then return new; end if;
  if old.lifecycle_contract = 'phase22' then
    if old.workflow_status in ('launched','completed','archived') and row(new.title,new.description,new.expected_output,new.deadline,new.audience,new.sensitivity,new.urgency,new.budget_range) is distinct from row(old.title,old.description,old.expected_output,old.deadline,old.audience,old.sensitivity,old.urgency,old.budget_range) then raise check_violation using message = 'phase22 task content is immutable after launch'; end if;
    if new.workflow_status is distinct from old.workflow_status and not ((old.workflow_status='draft' and new.workflow_status in ('analyzed','archived')) or (old.workflow_status='analyzed' and new.workflow_status in ('draft','approved','archived')) or (old.workflow_status='approved' and new.workflow_status in ('draft','launched','archived')) or (old.workflow_status='launched' and new.workflow_status='completed') or (old.workflow_status='completed' and new.workflow_status='archived')) then raise check_violation using message = 'invalid phase22 task lifecycle transition'; end if;
  end if;
  new.version := old.version + 1; new.updated_at := clock_timestamp(); return new;
end; $$;
create trigger tasks_manage_phase22_update before update on public.tasks for each row execute function public.phase22_manage_task_update();

create function public.phase22_claim_idempotency(p_owner_user_id uuid,p_operation text,p_idempotency_key text,p_request_hash text) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare existing public.idempotency_keys%rowtype; claimed_id uuid;
begin
 insert into public.idempotency_keys(owner_user_id,operation,idempotency_key,request_hash,state,response_status,response_body) values(p_owner_user_id,p_operation,p_idempotency_key,p_request_hash,'in_progress',202,'{"status":"in_progress"}'::jsonb) on conflict(owner_user_id,operation,idempotency_key) do nothing returning id into claimed_id;
 if claimed_id is not null then return jsonb_build_object('claimed',true,'state','in_progress'); end if;
 select * into existing from public.idempotency_keys where owner_user_id=p_owner_user_id and operation=p_operation and idempotency_key=p_idempotency_key;
 if existing.request_hash <> p_request_hash then raise exception using errcode='P0001',message='idempotency_conflict'; end if;
 return jsonb_build_object('claimed',false,'state',existing.state,'response_status',existing.response_status,'resource_id',existing.resource_id,'response_body',existing.response_body);
end; $$;
create function public.phase22_complete_idempotency(p_owner_user_id uuid,p_operation text,p_idempotency_key text,p_resource_id text,p_response_status integer,p_response_body jsonb default '{}'::jsonb) returns void language plpgsql set search_path = pg_catalog, public as $$ begin update public.idempotency_keys set state='completed',resource_id=p_resource_id,response_status=p_response_status,response_body=coalesce(p_response_body,'{}'::jsonb) where owner_user_id=p_owner_user_id and operation=p_operation and idempotency_key=p_idempotency_key and state='in_progress'; end; $$;

create function public.phase22_create_task(p_owner_user_id uuid,p_idempotency_key text,p_request_hash text,p_task_id text,p_payload jsonb,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'task.create',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 insert into public.tasks(id,owner_user_id,title,description,expected_output,deadline,audience,sensitivity,urgency,budget_range,workflow_status,source,lifecycle_contract) values(p_task_id,p_owner_user_id,p_payload->>'title',p_payload->>'description',p_payload->>'expected_output',nullif(p_payload->>'deadline','')::date,p_payload->>'audience',p_payload->>'sensitivity',p_payload->>'urgency',p_payload->>'budget_range','draft','full_stack','phase22');
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'task_created','Task created','Task created','completed',jsonb_build_object('version',1),p_trace_id);
 perform public.phase22_complete_idempotency(p_owner_user_id,'task.create',p_idempotency_key,p_task_id,201,jsonb_build_object('task_id',p_task_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',p_task_id);
end; $$;

create function public.phase22_update_task_content(p_owner_user_id uuid,p_task_id text,p_expected_version bigint,p_payload jsonb,p_trace_id uuid) returns bigint language plpgsql set search_path = pg_catalog, public as $$
declare changed_version bigint;
begin
 update public.tasks set title=p_payload->>'title',description=p_payload->>'description',expected_output=p_payload->>'expected_output',deadline=nullif(p_payload->>'deadline','')::date,audience=p_payload->>'audience',sensitivity=p_payload->>'sensitivity',urgency=p_payload->>'urgency',budget_range=p_payload->>'budget_range',workflow_status=case when workflow_status in ('analyzed','approved') then 'draft' else workflow_status end where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and version=p_expected_version and workflow_status in ('draft','analyzed','approved') returning version into changed_version;
 if changed_version is null then raise exception using errcode='P0001',message='version_conflict'; end if;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'task_updated','Task updated','Task updated','completed',jsonb_build_object('version',changed_version),p_trace_id); return changed_version;
end; $$;
create function public.phase22_assign_task_contract() returns trigger language plpgsql set search_path = pg_catalog, public as $$ begin if new.source='full_stack' and new.workflow_status='draft' and new.lifecycle_contract='legacy' then new.lifecycle_contract:='phase22'; end if; return new; end; $$;
create trigger tasks_assign_phase22_contract before insert on public.tasks for each row execute function public.phase22_assign_task_contract();

create function public.phase22_analyze_task(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_flow jsonb,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb; next_version integer; flow_id uuid;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'task.analyze',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status in ('draft','analyzed','approved') for update; if not found then raise exception using errcode='P0001',message='analysis_conflict'; end if;
 select coalesce(max(flow_version),0)+1 into next_version from public.task_flows where task_id=p_task_id and owner_user_id=p_owner_user_id;
 insert into public.task_flows(task_id,owner_user_id,flow_version,execution_id,analysis,recommendation,governance,selected_option,execution_record,policy_version,engine_version) values(p_task_id,p_owner_user_id,next_version,'execution_'||p_task_id,p_flow->'analysis',p_flow->'recommendation',p_flow->'governance',null,'{"status":"not_launched"}'::jsonb,'phase22-governance-v1','phase22-router-v1') returning id into flow_id;
 update public.tasks set workflow_status='analyzed' where id=p_task_id and owner_user_id=p_owner_user_id;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'system','phase22-router','task_analyzed','Task analyzed','Task analyzed',case when p_flow->'governance'->>'status'='blocked' then 'blocked' else 'completed' end,jsonb_build_object('flowVersion',next_version,'recommendedPath',p_flow->'recommendation'->>'recommendedPath','governanceStatus',p_flow->'governance'->>'status'),p_trace_id);
 perform public.phase22_complete_idempotency(p_owner_user_id,'task.analyze',p_idempotency_key,flow_id::text,200,jsonb_build_object('task_id',p_task_id,'flow_id',flow_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',flow_id);
end; $$;

create function public.phase22_approve_task(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_rationale text,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb; flow_row public.task_flows%rowtype; decision_id uuid;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'task.approve',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status='analyzed' for update; if not found then raise exception using errcode='P0001',message='approval_conflict'; end if;
 select * into flow_row from public.task_flows where task_id=p_task_id and owner_user_id=p_owner_user_id order by flow_version desc limit 1; if flow_row.id is null or flow_row.governance->>'status'='blocked' then raise exception using errcode='P0001',message='governance_blocked'; end if;
 insert into public.review_decisions(task_id,task_flow_id,owner_user_id,stage,action,decision_status,rationale,actor_user_id,related_governance) values(p_task_id,flow_row.id,p_owner_user_id,'pre_launch','approve_recommended','approved',p_rationale,p_owner_user_id,flow_row.governance) returning id into decision_id;
 update public.tasks set workflow_status='approved' where id=p_task_id and owner_user_id=p_owner_user_id;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'task_approved','Task approved for launch','Task approved for launch','approved',jsonb_build_object('flowVersion',flow_row.flow_version),p_trace_id);
 perform public.phase22_complete_idempotency(p_owner_user_id,'task.approve',p_idempotency_key,decision_id::text,200,jsonb_build_object('task_id',p_task_id,'decision_id',decision_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',decision_id);
end; $$;

create function public.phase22_confirm_attachment(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_file_name text,p_storage_path text,p_mime_type text,p_byte_size bigint,p_extracted_text text,p_sensitivity_status text,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb; attachment_id uuid; file_count bigint; chars bigint;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'attachment.confirm',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status in ('draft','analyzed','approved') for update; if not found then raise exception using errcode='P0001',message='attachment_conflict'; end if;
 select count(*),coalesce(sum(extracted_character_count),0) into file_count,chars from public.task_attachments where task_id=p_task_id and owner_user_id=p_owner_user_id;
 if file_count>=5 then raise exception using errcode='P0001',message='attachment_count_limit'; end if; if chars+char_length(p_extracted_text)>100000 then raise exception using errcode='P0001',message='attachment_character_limit'; end if;
 insert into public.task_attachments(task_id,owner_user_id,file_name,storage_path,mime_type,byte_size,extracted_text,extracted_character_count,sensitivity_status) values(p_task_id,p_owner_user_id,p_file_name,p_storage_path,p_mime_type,p_byte_size,p_extracted_text,char_length(p_extracted_text),p_sensitivity_status) returning id into attachment_id;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'attachment_added','Task attachment added','Task attachment added',case when p_sensitivity_status='blocked_high_sensitivity' then 'blocked' else 'completed' end,jsonb_build_object('attachmentId',attachment_id,'sensitivityStatus',p_sensitivity_status),p_trace_id);
 perform public.phase22_complete_idempotency(p_owner_user_id,'attachment.confirm',p_idempotency_key,attachment_id::text,201,jsonb_build_object('attachment_id',attachment_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',attachment_id);
end; $$;

create function public.phase22_claim_agent_run(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_provider text,p_model text,p_trace_id uuid,p_daily_quota integer,p_cooldown_seconds integer) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb; flow_row public.task_flows%rowtype; attempt integer; run_id uuid; daily_count bigint; latest_started timestamptz;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'agent.run',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if; perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_owner_user_id::text));
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status='approved' for update; if not found then raise exception using errcode='P0001',message='agent_requires_approved_task'; end if;
 select * into flow_row from public.task_flows where task_id=p_task_id and owner_user_id=p_owner_user_id order by flow_version desc limit 1; if flow_row.id is null then raise exception using errcode='P0001',message='agent_requires_flow'; end if; if flow_row.governance->>'status'='blocked' then raise exception using errcode='P0001',message='governance_blocked'; end if; if flow_row.recommendation->>'recommendedPath' not in ('agent','hybrid') then raise exception using errcode='P0001',message='agent_route_ineligible'; end if;
 if not exists(select 1 from public.review_decisions where task_id=p_task_id and task_flow_id=flow_row.id and owner_user_id=p_owner_user_id and stage='pre_launch' and decision_status='approved') then raise exception using errcode='P0001',message='agent_requires_human_approval'; end if;
 if exists(select 1 from public.task_attachments where task_id=p_task_id and owner_user_id=p_owner_user_id and sensitivity_status='blocked_high_sensitivity') then raise exception using errcode='P0001',message='sensitivity_blocked'; end if;
 select count(*),max(started_at) into daily_count,latest_started from public.agent_runs where owner_user_id=p_owner_user_id and run_mode='live_provider' and started_at>=date_trunc('day',clock_timestamp()); if daily_count>=p_daily_quota then raise exception using errcode='P0001',message='daily_quota_reached'; end if; if latest_started is not null and latest_started>clock_timestamp()-make_interval(secs=>p_cooldown_seconds) then raise exception using errcode='P0001',message='agent_cooldown'; end if; if exists(select 1 from public.agent_runs where task_id=p_task_id and status='running') then raise exception using errcode='P0001',message='active_run_conflict'; end if;
 select coalesce(max(attempt_number),0)+1 into attempt from public.agent_runs where task_id=p_task_id and attempt_number is not null; if attempt>3 then raise exception using errcode='P0001',message='attempts_exhausted'; end if;
 insert into public.agent_runs(run_key,task_id,task_flow_id,execution_id,owner_user_id,provider,requested_model,run_mode,status,input_snapshot,trace_id,attempt_number,request_id) values('agent_'||p_task_id||'_'||attempt||'_'||gen_random_uuid()::text,p_task_id,flow_row.id,flow_row.execution_id,p_owner_user_id,p_provider,p_model,'live_provider','running',jsonb_build_object('taskId',p_task_id),p_trace_id,attempt,p_trace_id) returning id into run_id;
 perform public.phase22_complete_idempotency(p_owner_user_id,'agent.run',p_idempotency_key,run_id::text,202,jsonb_build_object('run_id',run_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',run_id,'attempt_number',attempt);
exception when unique_violation then raise exception using errcode='P0001',message='active_or_attempt_conflict';
end; $$;

create function public.phase22_complete_agent_run(p_owner_user_id uuid,p_run_id uuid,p_status text,p_provider_run_id text,p_returned_model text,p_output jsonb,p_error jsonb) returns void language plpgsql set search_path = pg_catalog, public as $$ begin update public.agent_runs set status=p_status,provider_run_id=p_provider_run_id,returned_model=p_returned_model,normalized_output=case when p_status='completed' then p_output else null end,normalized_error=case when p_status in ('failed','timed_out') then p_error else null end,completed_at=clock_timestamp() where id=p_run_id and owner_user_id=p_owner_user_id and status='running'; if not found then raise exception using errcode='P0001',message='run_completion_conflict'; end if; end; $$;

create function public.phase22_record_post_output_review(p_owner_user_id uuid,p_task_id text,p_agent_run_id uuid,p_action text,p_rationale text,p_trace_id uuid) returns uuid language plpgsql set search_path = pg_catalog, public as $$
declare run_row public.agent_runs%rowtype; decision_id uuid; decision_status text;
begin
 if p_action not in ('accept_output','request_revision','reroute_to_human') then raise exception using errcode='P0001',message='invalid_post_output_action'; end if; select * into run_row from public.agent_runs where id=p_agent_run_id and task_id=p_task_id and owner_user_id=p_owner_user_id and status='completed'; if run_row.id is null then raise exception using errcode='P0001',message='review_requires_completed_run'; end if; decision_status:=case p_action when 'accept_output' then 'accepted_for_use' when 'request_revision' then 'needs_revision' else 'rerouted_to_human' end;
 insert into public.review_decisions(task_id,task_flow_id,agent_run_id,owner_user_id,stage,action,decision_status,rationale,actor_user_id) values(p_task_id,run_row.task_flow_id,run_row.id,p_owner_user_id,'post_output',p_action,decision_status,p_rationale,p_owner_user_id) returning id into decision_id;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'agent_output_reviewed','Agent output reviewed','Agent output reviewed',decision_status,jsonb_build_object('decisionId',decision_id,'agentRunId',run_row.id,'action',p_action),p_trace_id); return decision_id;
end; $$;
create function public.phase22_launch_task(p_owner_user_id uuid,p_task_id text,p_execution_option_id uuid,p_estimated_minutes integer,p_idempotency_key text,p_request_hash text,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb; option_row public.execution_options%rowtype; flow_row public.task_flows%rowtype; run_row public.agent_runs%rowtype; snapshot jsonb; execution_id uuid;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'task.launch',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status='approved' for update; if not found then raise exception using errcode='P0001',message='launch_conflict'; end if;
 select * into option_row from public.execution_options where id=p_execution_option_id and is_active; if option_row.id is null then raise exception using errcode='P0001',message='invalid_execution_option'; end if;
 select * into flow_row from public.task_flows where task_id=p_task_id and owner_user_id=p_owner_user_id order by flow_version desc limit 1; if flow_row.id is null or flow_row.governance->>'status'='blocked' then raise exception using errcode='P0001',message='governance_blocked'; end if;
 if option_row.route in ('agent','hybrid') then select * into run_row from public.agent_runs where task_id=p_task_id and owner_user_id=p_owner_user_id and status='completed' order by attempt_number desc nulls last,completed_at desc limit 1; if run_row.id is null or not exists(select 1 from public.review_decisions where agent_run_id=run_row.id and owner_user_id=p_owner_user_id and stage='post_output' and decision_status='accepted_for_use') then raise exception using errcode='P0001',message='launch_requires_accepted_output'; end if; end if;
 snapshot:=jsonb_build_object('id',option_row.id,'key',option_row.option_key,'version',option_row.version,'displayName',option_row.display_name,'route',option_row.route,'description',option_row.description);
 insert into public.executions(task_id,owner_user_id,execution_option_id,option_snapshot,status,estimated_minutes) values(p_task_id,p_owner_user_id,option_row.id,snapshot,'launched',p_estimated_minutes) returning id into execution_id;
 update public.tasks set workflow_status='launched',selected_execution_option_id=option_row.id,selected_execution_option_snapshot=snapshot where id=p_task_id and owner_user_id=p_owner_user_id;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'task_launched','Task launched','Task launched','completed',jsonb_build_object('executionId',execution_id,'optionKey',option_row.option_key,'optionVersion',option_row.version),p_trace_id);
 perform public.phase22_complete_idempotency(p_owner_user_id,'task.launch',p_idempotency_key,execution_id::text,201,jsonb_build_object('task_id',p_task_id,'execution_id',execution_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',execution_id);
end; $$;

create function public.phase22_record_outcome(p_owner_user_id uuid,p_task_id text,p_status text,p_actual_minutes integer,p_satisfaction_score integer,p_outcome_summary text,p_lessons_learned text,p_trace_id uuid) returns uuid language plpgsql set search_path = pg_catalog, public as $$
declare execution_id uuid;
begin
 update public.executions set status=p_status,actual_minutes=p_actual_minutes,satisfaction_score=p_satisfaction_score,outcome_summary=p_outcome_summary,lessons_learned=p_lessons_learned,completed_at=clock_timestamp() where task_id=p_task_id and owner_user_id=p_owner_user_id and status='launched' returning id into execution_id; if execution_id is null then raise exception using errcode='P0001',message='outcome_conflict'; end if;
 update public.tasks set workflow_status='completed' where id=p_task_id and owner_user_id=p_owner_user_id and workflow_status='launched'; if not found then raise exception using errcode='P0001',message='outcome_task_conflict'; end if;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'outcome_recorded','Execution outcome recorded','Execution outcome recorded','completed',jsonb_build_object('executionId',execution_id,'executionStatus',p_status,'satisfactionScore',p_satisfaction_score),p_trace_id); return execution_id;
end; $$;

create function public.phase22_archive_task(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'task.archive',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 update public.tasks set workflow_status='archived',archived_at=clock_timestamp() where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status in ('draft','analyzed','approved','completed'); if not found then raise exception using errcode='P0001',message='archive_conflict'; end if;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(p_task_id,p_owner_user_id,'human',p_owner_user_id::text,'task_archived','Task archived','Task archived','completed','{}'::jsonb,p_trace_id); perform public.phase22_complete_idempotency(p_owner_user_id,'task.archive',p_idempotency_key,p_task_id,200,jsonb_build_object('task_id',p_task_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',p_task_id);
end; $$;

create function public.phase22_hard_delete_task(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_trace_id uuid) returns jsonb language plpgsql set search_path = pg_catalog, public as $$
declare claim jsonb;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'task.hard_delete',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status='archived' for update; if not found then raise exception using errcode='P0001',message='delete_conflict'; end if;
 delete from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id;
 insert into public.audit_events(task_id,owner_user_id,actor_type,actor_id,event_type,label,description,status,metadata,trace_id) values(null,p_owner_user_id,'human',p_owner_user_id::text,'task_hard_deleted','Archived task permanently deleted','Archived task permanently deleted','completed',jsonb_build_object('deletedTaskId',p_task_id),p_trace_id); perform public.phase22_complete_idempotency(p_owner_user_id,'task.hard_delete',p_idempotency_key,p_task_id,200,jsonb_build_object('deleted_task_id',p_task_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',p_task_id);
end; $$;

revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.phase22_claim_idempotency(uuid,text,text,text),public.phase22_complete_idempotency(uuid,text,text,text,integer,jsonb),public.phase22_create_task(uuid,text,text,text,jsonb,uuid),public.phase22_update_task_content(uuid,text,bigint,jsonb,uuid),public.phase22_analyze_task(uuid,text,text,text,jsonb,uuid),public.phase22_approve_task(uuid,text,text,text,text,uuid),public.phase22_confirm_attachment(uuid,text,text,text,text,text,text,bigint,text,text,uuid),public.phase22_claim_agent_run(uuid,text,text,text,text,text,uuid,integer,integer),public.phase22_complete_agent_run(uuid,uuid,text,text,text,jsonb,jsonb),public.phase22_record_post_output_review(uuid,text,uuid,text,text,uuid),public.phase22_launch_task(uuid,text,uuid,integer,text,text,uuid),public.phase22_record_outcome(uuid,text,text,integer,integer,text,text,uuid),public.phase22_archive_task(uuid,text,text,text,uuid),public.phase22_hard_delete_task(uuid,text,text,text,uuid) to service_role;
grant select,insert,update,delete on public.tasks,public.task_flows,public.agent_runs,public.review_decisions,public.audit_events,public.task_attachments,public.idempotency_keys,public.execution_options,public.executions to service_role;
create unique index review_decisions_post_output_action_key on public.review_decisions (agent_run_id, action) where stage = 'post_output';

-- Phase 22 R1.1: immutable Agent execution inputs.
alter table public.task_attachments add column content_hash text;
update public.task_attachments set content_hash=encode(extensions.digest(convert_to(extracted_text,'UTF8'),'sha256'),'hex') where content_hash is null;
alter table public.task_attachments alter column content_hash set not null;
create function public.phase22_set_attachment_hash() returns trigger language plpgsql set search_path=pg_catalog,extensions as $$ begin new.content_hash:=encode(digest(convert_to(new.extracted_text,'UTF8'),'sha256'),'hex'); return new; end; $$;
create trigger task_attachments_set_hash before insert or update of extracted_text on public.task_attachments for each row execute function public.phase22_set_attachment_hash();
alter table public.agent_runs add column task_version bigint, add column flow_version integer, add column prelaunch_decision_id uuid references public.review_decisions(id);

create or replace function public.phase22_manage_task_update() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare content_changed boolean; meaningful boolean;
begin
 if new.version is distinct from old.version then raise check_violation using message='tasks.version is database managed'; end if;
 content_changed:=row(new.title,new.description,new.expected_output,new.deadline,new.audience,new.sensitivity,new.urgency,new.budget_range) is distinct from row(old.title,old.description,old.expected_output,old.deadline,old.audience,old.sensitivity,old.urgency,old.budget_range);
 meaningful:=content_changed or row(new.workflow_status,new.archived_at,new.selected_execution_option_id,new.selected_execution_option_snapshot) is distinct from row(old.workflow_status,old.archived_at,old.selected_execution_option_id,old.selected_execution_option_snapshot);
 if not meaningful then return new; end if;
 if old.lifecycle_contract='phase22' then
  if content_changed and exists(select 1 from public.agent_runs where task_id=old.id and status='running') then raise check_violation using message='task_has_active_agent_run'; end if;
  if content_changed and old.workflow_status in ('launched','completed','archived') then raise check_violation using message='phase22 task content is immutable after launch'; end if;
  if content_changed and old.workflow_status in ('analyzed','approved') then new.workflow_status:='draft'; end if;
  if new.workflow_status is distinct from old.workflow_status and not ((old.workflow_status='draft' and new.workflow_status in ('analyzed','archived')) or (old.workflow_status='analyzed' and new.workflow_status in ('draft','approved','archived')) or (old.workflow_status='approved' and new.workflow_status in ('draft','launched','archived')) or (old.workflow_status='launched' and new.workflow_status='completed') or (old.workflow_status='completed' and new.workflow_status='archived')) then raise check_violation using message='invalid phase22 task lifecycle transition'; end if;
 end if;
 new.version:=old.version+1; new.updated_at:=clock_timestamp(); return new;
end; $$;

create or replace function public.phase22_confirm_attachment(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_file_name text,p_storage_path text,p_mime_type text,p_byte_size bigint,p_extracted_text text,p_sensitivity_status text,p_trace_id uuid) returns jsonb language plpgsql set search_path=pg_catalog,public,extensions as $$
declare claim jsonb; attachment_id uuid; file_count bigint; chars bigint;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'attachment.confirm',p_idempotency_key,p_request_hash); if not(claim->>'claimed')::boolean then return claim; end if;
 perform 1 from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status='draft' for update; if not found then raise exception using errcode='P0001',message='attachment_requires_draft'; end if;
 select count(*),coalesce(sum(extracted_character_count),0) into file_count,chars from public.task_attachments where task_id=p_task_id and owner_user_id=p_owner_user_id;
 if file_count>=5 then raise exception using errcode='P0001',message='attachment_count_limit'; end if; if p_byte_size<1 or p_byte_size>1048576 then raise exception using errcode='P0001',message='attachment_size_limit'; end if; if chars+char_length(p_extracted_text)>100000 then raise exception using errcode='P0001',message='attachment_character_limit'; end if;
 insert into public.task_attachments(task_id,owner_user_id,file_name,storage_path,mime_type,byte_size,extracted_text,extracted_character_count,sensitivity_status,content_hash) values(p_task_id,p_owner_user_id,p_file_name,p_storage_path,p_mime_type,p_byte_size,p_extracted_text,char_length(p_extracted_text),p_sensitivity_status,encode(digest(convert_to(p_extracted_text,'UTF8'),'sha256'),'hex')) returning id into attachment_id;
 perform public.phase22_complete_idempotency(p_owner_user_id,'attachment.confirm',p_idempotency_key,attachment_id::text,201,jsonb_build_object('attachment_id',attachment_id)); return jsonb_build_object('claimed',true,'state','completed','resource_id',attachment_id);
end; $$;

drop function public.phase22_claim_agent_run(uuid,text,text,text,text,text,uuid,integer,integer);
create function public.phase22_claim_agent_run(p_owner_user_id uuid,p_task_id text,p_idempotency_key text,p_request_hash text,p_provider text,p_model text,p_trace_id uuid,p_daily_quota integer,p_cooldown_seconds integer,p_stale_seconds integer) returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare claim jsonb; task_row public.tasks%rowtype; flow_row public.task_flows%rowtype; approval_row public.review_decisions%rowtype; attempt integer; run_id uuid; daily_count bigint; latest_started timestamptz; attachments jsonb; prior public.agent_runs%rowtype;
begin
 claim:=public.phase22_claim_idempotency(p_owner_user_id,'agent.run',p_idempotency_key,p_request_hash);
 if not(claim->>'claimed')::boolean then
  if claim->>'state'='in_progress' and claim->>'resource_id' is not null then select * into prior from public.agent_runs where id=(claim->>'resource_id')::uuid; if prior.status='running' and prior.started_at<clock_timestamp()-make_interval(secs=>p_stale_seconds) then update public.agent_runs set status='failed',normalized_error='{"code":"stale_run_recovered"}'::jsonb,completed_at=clock_timestamp() where id=prior.id; perform public.phase22_complete_idempotency(p_owner_user_id,'agent.run',p_idempotency_key,prior.id::text,409,jsonb_build_object('run_id',prior.id,'status','failed')); end if; end if;
  return public.phase22_claim_idempotency(p_owner_user_id,'agent.run',p_idempotency_key,p_request_hash);
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_owner_user_id::text));
 select * into task_row from public.tasks where id=p_task_id and owner_user_id=p_owner_user_id and lifecycle_contract='phase22' and workflow_status='approved' for update; if task_row.id is null then raise exception using errcode='P0001',message='agent_requires_approved_task'; end if; if task_row.sensitivity is null or task_row.sensitivity='high' then raise exception using errcode='P0001',message='sensitivity_blocked'; end if;
 select * into flow_row from public.task_flows where task_id=p_task_id and owner_user_id=p_owner_user_id order by flow_version desc limit 1; if flow_row.id is null then raise exception using errcode='P0001',message='agent_requires_flow'; end if; if coalesce(flow_row.governance->>'status','') not in ('allowed','approval_required','approved') then raise exception using errcode='P0001',message='governance_blocked'; end if; if coalesce(flow_row.recommendation->>'recommendedPath','') not in ('agent','hybrid') then raise exception using errcode='P0001',message='agent_route_ineligible'; end if;
 select * into approval_row from public.review_decisions where task_id=p_task_id and task_flow_id=flow_row.id and stage='pre_launch' and decision_status='approved' order by decided_at desc limit 1; if approval_row.id is null then raise exception using errcode='P0001',message='agent_requires_human_approval'; end if; if exists(select 1 from public.task_attachments where task_id=p_task_id and owner_user_id=p_owner_user_id and sensitivity_status<>'allowed') then raise exception using errcode='P0001',message='sensitivity_blocked'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'contentHash',content_hash,'fileName',file_name,'extractedText',extracted_text) order by id),'[]'::jsonb) into attachments from public.task_attachments where task_id=p_task_id and owner_user_id=p_owner_user_id;
 select count(*),max(started_at) into daily_count,latest_started from public.agent_runs where owner_user_id=p_owner_user_id and run_mode='live_provider' and started_at>=date_trunc('day',clock_timestamp()); if daily_count>=p_daily_quota then raise exception using errcode='P0001',message='daily_quota_reached'; end if; if latest_started is not null and latest_started>clock_timestamp()-make_interval(secs=>p_cooldown_seconds) then raise exception using errcode='P0001',message='agent_cooldown'; end if; if exists(select 1 from public.agent_runs where task_id=p_task_id and status='running') then raise exception using errcode='P0001',message='active_run_conflict'; end if;
 select coalesce(max(attempt_number),0)+1 into attempt from public.agent_runs where task_id=p_task_id and attempt_number is not null; if attempt>3 then raise exception using errcode='P0001',message='attempts_exhausted'; end if;
 insert into public.agent_runs(run_key,task_id,task_flow_id,execution_id,owner_user_id,provider,requested_model,run_mode,status,input_snapshot,trace_id,attempt_number,request_id,task_version,flow_version,prelaunch_decision_id) values('agent_'||p_task_id||'_'||attempt||'_'||gen_random_uuid()::text,p_task_id,flow_row.id,flow_row.execution_id,p_owner_user_id,p_provider,p_model,'live_provider','running',jsonb_build_object('task',jsonb_build_object('id',task_row.id,'version',task_row.version,'title',task_row.title,'description',task_row.description,'expectedOutput',task_row.expected_output),'flow',jsonb_build_object('id',flow_row.id,'version',flow_row.flow_version),'prelaunchDecision',jsonb_build_object('id',approval_row.id),'attachments',attachments),p_trace_id,attempt,p_trace_id,task_row.version,flow_row.flow_version,approval_row.id) returning id into run_id;
 update public.idempotency_keys set resource_id=run_id::text,response_body=jsonb_build_object('run_id',run_id,'status','running') where owner_user_id=p_owner_user_id and operation='agent.run' and idempotency_key=p_idempotency_key;
 return jsonb_build_object('claimed',true,'state','in_progress','resource_id',run_id);
end; $$;

drop function public.phase22_complete_agent_run(uuid,uuid,text,text,text,jsonb,jsonb);
create function public.phase22_complete_agent_run(p_owner_user_id uuid,p_run_id uuid,p_idempotency_key text,p_status text,p_provider_run_id text,p_returned_model text,p_output jsonb,p_error jsonb) returns jsonb language plpgsql set search_path=pg_catalog,public as $$
begin
 update public.agent_runs set status=p_status,provider_run_id=p_provider_run_id,returned_model=p_returned_model,normalized_output=case when p_status='completed' then p_output else null end,normalized_error=case when p_status<>'completed' then p_error else null end,completed_at=clock_timestamp() where id=p_run_id and owner_user_id=p_owner_user_id and status='running'; if not found then raise exception using errcode='P0001',message='run_completion_conflict'; end if;
 perform public.phase22_complete_idempotency(p_owner_user_id,'agent.run',p_idempotency_key,p_run_id::text,case when p_status='completed' then 200 when p_status='timed_out' then 504 else 502 end,jsonb_build_object('run_id',p_run_id,'status',p_status)); return jsonb_build_object('run_id',p_run_id,'status',p_status);
end; $$;

revoke all on function public.phase22_claim_agent_run(uuid,text,text,text,text,text,uuid,integer,integer,integer),public.phase22_complete_agent_run(uuid,uuid,text,text,text,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.phase22_claim_agent_run(uuid,text,text,text,text,text,uuid,integer,integer,integer),public.phase22_complete_agent_run(uuid,uuid,text,text,text,text,jsonb,jsonb) to service_role;
