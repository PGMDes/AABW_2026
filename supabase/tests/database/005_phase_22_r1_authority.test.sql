begin;
select plan(27);

insert into auth.users (id, email) values ('55555555-5555-5555-5555-555555555555', 'r1-owner@example.test');

insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source, lifecycle_contract)
values ('task_r1', '55555555-5555-5555-5555-555555555555', 'R1', 'Original', 'Output', 'internal', 'low', 'medium', 'low', 'draft', 'full_stack', 'phase22');

select is((select version from public.tasks where id = 'task_r1'), 1::bigint, 'phase22 task starts at version one');
update public.tasks set description = 'Changed' where id = 'task_r1';
select is((select version from public.tasks where id = 'task_r1'), 2::bigint, 'content update increments version once');
select ok((select updated_at > created_at from public.tasks where id = 'task_r1'), 'content update refreshes updated_at');
select throws_ok($$update public.tasks set version = 1 where id = 'task_r1'$$, '23514', null, 'client cannot decrement version');

update public.tasks set workflow_status = 'analyzed' where id = 'task_r1';
select is((select version from public.tasks where id = 'task_r1'), 3::bigint, 'status update increments version once');
select throws_ok($$update public.tasks set workflow_status = 'completed' where id = 'task_r1'$$, '23514', null, 'invalid phase22 lifecycle jump rejected');
update public.tasks set workflow_status = 'archived', archived_at = now() where id = 'task_r1';
select throws_ok($$update public.tasks set workflow_status = 'draft', archived_at = null where id = 'task_r1'$$, '23514', null, 'archived phase22 task cannot unarchive without contract');
select throws_ok($$insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source, lifecycle_contract) values ('task_r1_bad', '55555555-5555-5555-5555-555555555555', 'R1', 'D', 'O', 'internal', 'low', 'medium', 'low', 'submitted', 'full_stack', 'phase22')$$, '23514', null, 'phase22 full stack task cannot use legacy status');

select has_function('public', 'phase22_create_task', 'atomic create task RPC exists');
select has_function('public', 'phase22_analyze_task', 'atomic analyze RPC exists');
select has_function('public', 'phase22_approve_task', 'atomic approve RPC exists');
select has_function('public', 'phase22_launch_task', 'atomic launch RPC exists');
select has_function('public', 'phase22_record_outcome', 'atomic outcome RPC exists');
select has_function('public', 'phase22_archive_task', 'atomic archive RPC exists');
select has_function('public', 'phase22_confirm_attachment', 'atomic attachment confirm RPC exists');
select has_function('public', 'phase22_claim_agent_run', 'atomic agent claim RPC exists');
select has_function('public', 'phase22_record_post_output_review', 'post-output review RPC exists');

select has_index('public', 'agent_runs', 'agent_runs_task_attempt_number_key', 'attempt numbers have a unique per-task index');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname like 'phase22_%' and p.prosecdef), 0::bigint, 'phase22 functions are not security definer');


-- Atomic command behavior: a repeated key replays one durable Task.
select is(
    (select (public.phase22_create_task(
        '55555555-5555-5555-5555-555555555555', 'create-r1', 'hash-create', 'task_r1_atomic',
        '{"title":"Atomic","description":"D","expected_output":"O","audience":"internal","sensitivity":"low","urgency":"medium","budget_range":"low"}'::jsonb,
        '55555555-5555-5555-5555-555555555555'
    )->>'resource_id')),
    'task_r1_atomic',
    'atomic create returns task reference'
);
select is((select count(*) from public.tasks where id = 'task_r1_atomic'), 1::bigint, 'atomic create inserted one task');
select is(
    (select (public.phase22_create_task(
        '55555555-5555-5555-5555-555555555555', 'create-r1', 'hash-create', 'task_r1_atomic_duplicate',
        '{"title":"Atomic","description":"D","expected_output":"O","audience":"internal","sensitivity":"low","urgency":"medium","budget_range":"low"}'::jsonb,
        '55555555-5555-5555-5555-555555555555'
    )->>'claimed')),
    'false',
    'same create idempotency key replays instead of creating another task'
);
select is((select count(*) from public.tasks where id like 'task_r1_atomic%'), 1::bigint, 'replayed create has no duplicate side effect');
select throws_ok(
    $$select public.phase22_create_task('55555555-5555-5555-5555-555555555555', 'create-r1', 'different-hash', 'task_r1_conflict', '{"title":"Atomic","description":"D","expected_output":"O","audience":"internal","sensitivity":"low","urgency":"medium","budget_range":"low"}'::jsonb, '55555555-5555-5555-5555-555555555555')$$,
    'P0001', 'idempotency_conflict', 'same idempotency key with a different hash conflicts'
);
select throws_ok(
    $$select public.phase22_analyze_task('55555555-5555-5555-5555-555555555555', 'task_r1_atomic', 'analyze-bad', 'hash-analyze', '{}'::jsonb, '55555555-5555-5555-5555-555555555555')$$,
    '23502', null, 'invalid analyze payload rolls back its transaction'
);
select is((select workflow_status from public.tasks where id = 'task_r1_atomic'), 'draft', 'failed analysis left task state unchanged');
select is((select count(*) from public.idempotency_keys where owner_user_id = '55555555-5555-5555-5555-555555555555' and operation = 'task.analyze' and idempotency_key = 'analyze-bad'), 0::bigint, 'failed analysis rolled back idempotency claim');
select * from finish();
rollback;
