-- ============================================================================
-- Phase 22B.2 - Row Level Security owner-isolation tests
-- ----------------------------------------------------------------------------
-- Inserts two deterministic fake auth.users and owner-specific records as the
-- privileged postgres role (RLS bypass), then switches into the authenticated
-- role with a JWT subject claim to verify each user sees only their own rows.
--
-- Also verifies:
--   * anonymous SELECT is denied (permission denied);
--   * authenticated INSERT/UPDATE/DELETE are denied even when owner_user_id
--     matches the current user;
--   * no policy relies on user metadata or auth.role().
--
-- Supabase RLS test context pattern:
--   set local role authenticated;
--   set local request.jwt.claim.sub to '<uuid>';
--   reset role;
--
-- No credentials. Deterministic fake UUIDs and fake emails only.
-- ============================================================================
begin;

select plan(20);

-- ----------------------------------------------------------------------------
-- Test data setup (runs as the privileged postgres role; RLS is bypassed).
-- ----------------------------------------------------------------------------
insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'owner-a@example.test');
insert into auth.users (id, email)
values ('22222222-2222-2222-2222-222222222222', 'owner-b@example.test');

insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_a_001', '11111111-1111-1111-1111-111111111111', 'A task', 'desc', 'out', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_b_001', '22222222-2222-2222-2222-222222222222', 'B task', 'desc', 'out', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');

insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'task_a_001', '11111111-1111-1111-1111-111111111111', 1, 'execution_task_a_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'task_b_001', '22222222-2222-2222-2222-222222222222', 1, 'execution_task_b_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');

insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'agent_run_task_a_001', 'task_a_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_a_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '11111111-0000-0000-0000-000000000001', now());
insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at)
values ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'agent_run_task_b_001', 'task_b_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'execution_task_b_001', '22222222-2222-2222-2222-222222222222', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '22222222-0000-0000-0000-000000000001', now());

insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id)
values ('task_a_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, '11111111-1111-1111-1111-111111111111', 'pre_launch', 'approve_recommended', 'approved', '11111111-1111-1111-1111-111111111111');
insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id)
values ('task_b_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, '22222222-2222-2222-2222-222222222222', 'pre_launch', 'approve_recommended', 'approved', '22222222-2222-2222-2222-222222222222');

insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status)
values ('task_a_001', '11111111-1111-1111-1111-111111111111', 'human', '11111111-1111-1111-1111-111111111111', 'task_submitted', 'Task submitted', 'Owner A task submitted', 'completed');
insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status)
values ('task_b_001', '22222222-2222-2222-2222-222222222222', 'human', '22222222-2222-2222-2222-222222222222', 'task_submitted', 'Task submitted', 'Owner B task submitted', 'completed');
-- Null-task workspace reset event for owner A (legitimate system event).
insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status)
values (null, '11111111-1111-1111-1111-111111111111', 'system', 'system', 'demo_workspace_reset', 'Workspace reset', 'Owner A demo workspace reset', 'completed');

-- ----------------------------------------------------------------------------
-- Owner A context: sees only A-owned rows across all five tables.
-- ----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub to '11111111-1111-1111-1111-111111111111';

select is((select count(*) from public.tasks), 1::bigint, 'A sees exactly own 1 task');
select is((select count(*) from public.task_flows), 1::bigint, 'A sees exactly own 1 task_flow');
select is((select count(*) from public.agent_runs), 1::bigint, 'A sees exactly own 1 agent_run');
select is((select count(*) from public.review_decisions), 1::bigint, 'A sees exactly own 1 review_decision');
select is((select count(*) from public.audit_events), 2::bigint, 'A sees exactly own 2 audit_events (1 task-linked + 1 null-task)');
select is((select count(*) from public.tasks where id = 'task_b_001'), 0::bigint, 'A cannot see B task');
select is((select count(*) from public.audit_events where task_id = 'task_b_001'), 0::bigint, 'A cannot see B task-linked audit events');
select is((select count(*) from public.audit_events where task_id is null), 1::bigint, 'A sees own null-task workspace audit event');

reset role;

-- ----------------------------------------------------------------------------
-- Owner B context: sees only B-owned rows; A null-task audit is invisible.
-- ----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub to '22222222-2222-2222-2222-222222222222';

select is((select count(*) from public.tasks), 1::bigint, 'B sees exactly own 1 task');
select is((select count(*) from public.task_flows), 1::bigint, 'B sees exactly own 1 task_flow');
select is((select count(*) from public.agent_runs), 1::bigint, 'B sees exactly own 1 agent_run');
select is((select count(*) from public.review_decisions), 1::bigint, 'B sees exactly own 1 review_decision');
select is((select count(*) from public.audit_events), 1::bigint, 'B sees exactly own 1 audit_event');
select is((select count(*) from public.audit_events where task_id is null), 0::bigint, 'B does not see A null-task audit event');

reset role;

-- ----------------------------------------------------------------------------
-- Anonymous SELECT is denied (permission denied, SQLSTATE 42501).
-- ----------------------------------------------------------------------------
set local role anon;
select throws_ok(
    'select * from public.tasks',
    '42501',
    null,
    'anon SELECT denied on tasks'
);
select throws_ok(
    'select * from public.audit_events',
    '42501',
    null,
    'anon SELECT denied on audit_events'
);
reset role;

-- ----------------------------------------------------------------------------
-- Authenticated writes are denied even when owner_user_id matches the
-- current user. No INSERT/UPDATE/DELETE grant exists.
-- ----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub to '11111111-1111-1111-1111-111111111111';

select throws_ok(
    $$insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source) values ('task_rls_insert', '11111111-1111-1111-1111-111111111111', 't', 'd', 'o', 'internal', 'low', 'medium', 'low', 'submitted', 'demo')$$,
    '42501',
    null,
    'authenticated INSERT denied on tasks even when owner matches'
);
select throws_ok(
    $$update public.tasks set title = 'x' where id = 'task_a_001'$$,
    '42501',
    null,
    'authenticated UPDATE denied on tasks'
);
select throws_ok(
    $$delete from public.tasks where id = 'task_a_001'$$,
    '42501',
    null,
    'authenticated DELETE denied on tasks'
);

reset role;

-- ----------------------------------------------------------------------------
-- No policy relies on user metadata or auth.role().
-- ----------------------------------------------------------------------------
select is(
    (select count(*) from pg_policies
     where schemaname = 'public'
       and (qual like '%user_metadata%' or qual like '%auth.role()%')),
    0::bigint,
    'no policy relies on user metadata or auth.role()'
);

select finish();
rollback;
