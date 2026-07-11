begin;
select plan(13);

select has_column('public', 'tasks', 'version', 'tasks have optimistic concurrency version');
select has_column('public', 'tasks', 'archived_at', 'tasks record archive time');
select has_column('public', 'agent_runs', 'attempt_number', 'agent runs record attempt number');
select has_table('public', 'task_attachments', 'task attachments table exists');
select has_table('public', 'idempotency_keys', 'idempotency table exists');
select has_table('public', 'execution_options', 'curated execution catalog exists');
select has_table('public', 'executions', 'execution tracker exists');

insert into auth.users (id, email) values ('44444444-4444-4444-4444-444444444444', 'phase22-pilot@example.test');
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_phase22_pilot', '44444444-4444-4444-4444-444444444444', 'Pilot task', 'Pilot description', 'Pilot output', 'internal', 'low', 'medium', 'low', 'draft', 'full_stack');
select is((select version from public.tasks where id = 'task_phase22_pilot'), 1::bigint, 'new task starts at version one');
select throws_ok($$update public.tasks set workflow_status = 'completed' where id = 'task_phase22_pilot'$$, '23514', null, 'task cannot jump directly from draft to completed');

insert into public.task_attachments (task_id, owner_user_id, file_name, storage_path, mime_type, byte_size, extracted_text, extracted_character_count, sensitivity_status)
values ('task_phase22_pilot', '44444444-4444-4444-4444-444444444444', 'context.md', '44444444/task_phase22_pilot/context.md', 'text/markdown', 12, '# Context', 9, 'allowed');
select is((select count(*) from public.task_attachments where task_id = 'task_phase22_pilot'), 1::bigint, 'attachment metadata can be recorded');

insert into public.idempotency_keys (owner_user_id, operation, idempotency_key, request_hash, response_status, response_body)
values ('44444444-4444-4444-4444-444444444444', 'task.create', 'same-command', 'hash-1', 201, '{}'::jsonb);
select throws_ok($$insert into public.idempotency_keys (owner_user_id, operation, idempotency_key, request_hash, response_status, response_body) values ('44444444-4444-4444-4444-444444444444', 'task.create', 'same-command', 'hash-1', 201, '{}'::jsonb)$$, '23505', null, 'duplicate idempotency key is rejected');

select is((select count(*) from public.execution_options where is_active), 3::bigint, 'three curated execution options are seeded');
select ok((select relrowsecurity from pg_class where oid = 'public.task_attachments'::regclass), 'attachments have RLS enabled');

select * from finish();
rollback;
