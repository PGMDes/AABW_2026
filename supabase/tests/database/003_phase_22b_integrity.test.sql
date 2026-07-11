-- ============================================================================
-- Phase 22B.2 - Constraints and relational integrity tests
-- ----------------------------------------------------------------------------
-- Verifies check constraints, composite foreign-key ownership enforcement,
-- unique/partial-unique indexes, delete behavior (cascade vs NO ACTION), and
-- the documented null-task workspace audit evidence semantics.
--
-- All data is created inside this transaction as the privileged postgres role
-- (RLS bypass) and rolled back at the end. Deterministic fake UUIDs and fake
-- emails only. No credentials.
--
-- SQLSTATE codes used:
--   23503 foreign_key_violation  (cross-owner / mismatched / referenced delete)
--   23505 unique_violation       (duplicate key / partial unique active run)
--   23514 check_violation        (enum-like / lifecycle / shape constraints)
-- ============================================================================
begin;

select plan(35);

-- ----------------------------------------------------------------------------
-- Deterministic fake identities
-- ----------------------------------------------------------------------------
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'owner-a@example.test');
insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'owner-b@example.test');
insert into auth.users (id, email) values ('33333333-3333-3333-3333-333333333333', 'owner-c@example.test');

-- ----------------------------------------------------------------------------
-- 1. task_001 (text id, source demo) can be inserted
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_001', '11111111-1111-1111-1111-111111111111', 'T1', 'D1', 'O1', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
select is((select count(*) from public.tasks where id = 'task_001'), 1::bigint, 'task_001 text id inserted with source demo');

-- ----------------------------------------------------------------------------
-- 2. Generated-style text task id with source full_stack can be inserted
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'T2', 'D2', 'O2', 'internal', 'low', 'medium', 'low', 'submitted', 'full_stack');
select is((select count(*) from public.tasks where id = 'task_550e8400-e29b-41d4-a716-446655440000'), 1::bigint, 'generated text task id inserted with source full_stack');

-- ----------------------------------------------------------------------------
-- 3. execution_task_001 can be persisted in a flow
-- ----------------------------------------------------------------------------
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'task_001', '11111111-1111-1111-1111-111111111111', 1, 'execution_task_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
select is((select count(*) from public.task_flows where task_id = 'task_001' and execution_id = 'execution_task_001'), 1::bigint, 'execution_task_001 persisted in task_flows version 1');

-- ----------------------------------------------------------------------------
-- 4. Flow versions 1 and 2 may share the same execution ID
-- ----------------------------------------------------------------------------
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'task_001', '11111111-1111-1111-1111-111111111111', 2, 'execution_task_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
select is((select count(*) from public.task_flows where task_id = 'task_001' and execution_id = 'execution_task_001'), 2::bigint, 'flow versions 1 and 2 share execution_task_001');

-- ----------------------------------------------------------------------------
-- 5. Task source 'local' is rejected (browser-local must not be persisted)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source) values ('task_local', '11111111-1111-1111-1111-111111111111', 't', 'd', 'o', 'internal', 'low', 'medium', 'low', 'submitted', 'local')$$,
    '23514',
    null,
    'task source local rejected'
);

-- ----------------------------------------------------------------------------
-- 6. Duplicate (task_id, flow_version) is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version) values ('cafef00d-0000-0000-0000-000000000001', 'task_001', '11111111-1111-1111-1111-111111111111', 1, 'execution_task_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'v', 'v')$$,
    '23505',
    null,
    'duplicate (task_id, flow_version) rejected'
);

-- ----------------------------------------------------------------------------
-- 7. Cross-owner flow insertion is rejected (composite FK)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version) values ('cafef00d-0000-0000-0000-000000000002', 'task_001', '22222222-2222-2222-2222-222222222222', 3, 'execution_task_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'v', 'v')$$,
    '23503',
    null,
    'cross-owner flow rejected (owner does not match task owner)'
);

-- ----------------------------------------------------------------------------
-- Setup: owner B task + flow + completed run (no post-output review)
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_b_001', '22222222-2222-2222-2222-222222222222', 'TB', 'DB', 'OB', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'task_b_001', '22222222-2222-2222-2222-222222222222', 1, 'execution_task_b_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at, normalized_output)
values ('a3a3a3a3-3333-3333-3333-333333333333', 'agent_run_task_b_001', 'task_b_001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'execution_task_b_001', '22222222-2222-2222-2222-222222222222', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '00000000-0000-0000-0000-000000000003', now(), '{}'::jsonb);

-- ----------------------------------------------------------------------------
-- 8. Completed agent run happy path can be inserted
-- ----------------------------------------------------------------------------
insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at, normalized_output)
values ('a1a1a1a1-1111-1111-1111-111111111111', 'agent_run_task_001_001', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '00000000-0000-0000-0000-000000000001', now(), '{}'::jsonb);
select is((select count(*) from public.agent_runs where run_key = 'agent_run_task_001_001'), 1::bigint, 'completed agent run inserted');

-- ----------------------------------------------------------------------------
-- 9. First running agent run for a task can be inserted (base for test 15)
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_run_001', '11111111-1111-1111-1111-111111111111', 'TR', 'DR', 'OR', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'task_run_001', '11111111-1111-1111-1111-111111111111', 1, 'execution_task_run_001', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id)
values ('a2a2a2a2-2222-2222-2222-222222222222', 'agent_run_task_run_001_running', 'task_run_001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'execution_task_run_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'running', '{}'::jsonb, '00000000-0000-0000-0000-000000000002');
select is((select count(*) from public.agent_runs where task_id = 'task_run_001' and status = 'running'), 1::bigint, 'first running run for task_run_001 inserted');

-- ----------------------------------------------------------------------------
-- 10. Agent run with mismatched task_id is rejected (composite flow identity FK)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id) values ('99999999-0000-0000-0000-000000000001', 'rk_mismatch_task', 'task_b_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'running', '{}'::jsonb, '00000000-0000-0000-0000-000000000099')$$,
    '23503',
    null,
    'agent run with mismatched task_id rejected'
);

-- ----------------------------------------------------------------------------
-- 11. Agent run with mismatched owner is rejected (composite flow identity FK)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id) values ('99999999-0000-0000-0000-000000000002', 'rk_mismatch_owner', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '22222222-2222-2222-2222-222222222222', 'openai', 'local_deterministic', 'running', '{}'::jsonb, '00000000-0000-0000-0000-000000000098')$$,
    '23503',
    null,
    'agent run with mismatched owner rejected'
);

-- ----------------------------------------------------------------------------
-- 12. Agent run with mismatched execution_id is rejected (composite flow FK)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id) values ('99999999-0000-0000-0000-000000000003', 'rk_mismatch_exec', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_wrong', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'running', '{}'::jsonb, '00000000-0000-0000-0000-000000000097')$$,
    '23503',
    null,
    'agent run with mismatched execution_id rejected'
);

-- ----------------------------------------------------------------------------
-- 13. Agent run with nonexistent flow_id is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id) values ('99999999-0000-0000-0000-000000000004', 'rk_mismatch_flow', 'task_001', '00000000-0000-0000-0000-000000000099', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'running', '{}'::jsonb, '00000000-0000-0000-0000-000000000096')$$,
    '23503',
    null,
    'agent run with nonexistent flow_id rejected'
);

-- ----------------------------------------------------------------------------
-- 14. Duplicate run_key is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at, normalized_output) values ('99999999-0000-0000-0000-000000000005', 'agent_run_task_001_001', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '00000000-0000-0000-0000-000000000095', now(), '{}'::jsonb)$$,
    '23505',
    null,
    'duplicate run_key rejected'
);

-- ----------------------------------------------------------------------------
-- 15. Two simultaneous running runs for one task are rejected (partial unique)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id) values ('99999999-0000-0000-0000-000000000006', 'agent_run_task_run_001_running_2', 'task_run_001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'execution_task_run_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'running', '{}'::jsonb, '00000000-0000-0000-0000-000000000094')$$,
    '23505',
    null,
    'second running run for same task rejected'
);

-- ----------------------------------------------------------------------------
-- 16. Terminal run (completed) without completed_at is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id) values ('b1b1b1b1-0000-0000-0000-000000000001', 'rk_life_completed', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '00000000-0000-0000-0000-0000000000b1')$$,
    '23514',
    null,
    'completed run without completed_at rejected'
);

-- ----------------------------------------------------------------------------
-- 17. Failed run without normalized_error is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at) values ('b2b2b2b2-0000-0000-0000-000000000002', 'rk_life_failed', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'failed', '{}'::jsonb, '00000000-0000-0000-0000-0000000000b2', now())$$,
    '23514',
    null,
    'failed run without normalized_error rejected'
);

-- ----------------------------------------------------------------------------
-- 18. Timed-out run without normalized_error is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at) values ('b3b3b3b3-0000-0000-0000-000000000003', 'rk_life_timed_out', 'task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'execution_task_001', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'timed_out', '{}'::jsonb, '00000000-0000-0000-0000-0000000000b3', now())$$,
    '23514',
    null,
    'timed_out run without normalized_error rejected'
);

-- ----------------------------------------------------------------------------
-- Setup: pre-launch review on flow1 and post-output review on run_completed
-- (used by duplicate-decision tests 24 and 25)
-- ----------------------------------------------------------------------------
insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id)
values ('task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, '11111111-1111-1111-1111-111111111111', 'pre_launch', 'approve_recommended', 'approved', '11111111-1111-1111-1111-111111111111');
insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id)
values ('task_001', null, 'a1a1a1a1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'post_output', 'accept_output', 'accepted_for_use', '11111111-1111-1111-1111-111111111111');

-- ----------------------------------------------------------------------------
-- 19. Invalid review stage is rejected
-- (uses flow2 which has no pre-launch review, so no unique conflict)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, '11111111-1111-1111-1111-111111111111', 'invalid_stage', 'approve_recommended', 'approved', '11111111-1111-1111-1111-111111111111')$$,
    '23514',
    null,
    'invalid review stage rejected'
);

-- ----------------------------------------------------------------------------
-- 20. Invalid pre_launch action is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, '11111111-1111-1111-1111-111111111111', 'pre_launch', 'accept_output', 'approved', '11111111-1111-1111-1111-111111111111')$$,
    '23514',
    null,
    'invalid pre_launch action rejected'
);

-- ----------------------------------------------------------------------------
-- 21. Invalid pre_launch decision_status is rejected
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, '11111111-1111-1111-1111-111111111111', 'pre_launch', 'approve_recommended', 'accepted_for_use', '11111111-1111-1111-1111-111111111111')$$,
    '23514',
    null,
    'invalid pre_launch decision_status rejected'
);

-- ----------------------------------------------------------------------------
-- 22. Pre-launch decision with agent_run_id set is rejected (stage shape)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a1a1a1a1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'pre_launch', 'approve_recommended', 'approved', '11111111-1111-1111-1111-111111111111')$$,
    '23514',
    null,
    'pre_launch decision with agent_run_id set rejected'
);

-- ----------------------------------------------------------------------------
-- 23. Post-output decision with agent_run_id null is rejected (stage shape)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', null, null, '11111111-1111-1111-1111-111111111111', 'post_output', 'accept_output', 'accepted_for_use', '11111111-1111-1111-1111-111111111111')$$,
    '23514',
    null,
    'post_output decision with agent_run_id null rejected'
);

-- ----------------------------------------------------------------------------
-- 24. Duplicate pre-launch decision per flow is rejected (partial unique)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, '11111111-1111-1111-1111-111111111111', 'pre_launch', 'switch_to_human', 'approved', '11111111-1111-1111-1111-111111111111')$$,
    '23505',
    null,
    'duplicate pre-launch decision per flow rejected'
);

-- ----------------------------------------------------------------------------
-- 25. Duplicate post-output decision per run is rejected (partial unique)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', null, 'a1a1a1a1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'post_output', 'request_revision', 'needs_revision', '11111111-1111-1111-1111-111111111111')$$,
    '23505',
    null,
    'duplicate post-output decision per run rejected'
);

-- ----------------------------------------------------------------------------
-- 26. Cross-owner pre-launch review is rejected (composite FK)
-- (flow2 has no pre-launch review, so no unique conflict; FK fails first)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, '22222222-2222-2222-2222-222222222222', 'pre_launch', 'approve_recommended', 'approved', '22222222-2222-2222-2222-222222222222')$$,
    '23503',
    null,
    'cross-owner pre-launch review rejected'
);

-- ----------------------------------------------------------------------------
-- 27. Cross-owner post-output review is rejected (composite FK)
-- (runB has no post-output review, so no unique conflict; FK fails first)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id) values ('task_b_001', null, 'a3a3a3a3-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'post_output', 'accept_output', 'accepted_for_use', '11111111-1111-1111-1111-111111111111')$$,
    '23503',
    null,
    'cross-owner post-output review rejected'
);

-- ----------------------------------------------------------------------------
-- 28. Task-linked audit event with wrong owner is rejected (composite FK)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status) values ('task_001', '22222222-2222-2222-2222-222222222222', 'human', '22222222-2222-2222-2222-222222222222', 'task_submitted', 'x', 'x', 'completed')$$,
    '23503',
    null,
    'task-linked audit event with wrong owner rejected'
);

-- ----------------------------------------------------------------------------
-- 29. Null-task workspace audit event succeeds
-- ----------------------------------------------------------------------------
insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status)
values (null, '11111111-1111-1111-1111-111111111111', 'system', 'system', 'demo_workspace_reset', 'Workspace reset', 'Owner A demo workspace reset', 'completed');
select is((select count(*) from public.audit_events where task_id is null and owner_user_id = '11111111-1111-1111-1111-111111111111'), 1::bigint, 'null-task workspace audit event succeeds');

-- ----------------------------------------------------------------------------
-- 30. Deleting a referenced flow is blocked (NO ACTION on agent_runs.task_flow_id)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$delete from public.task_flows where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
    '23503',
    null,
    'deleting a referenced flow is blocked'
);

-- ----------------------------------------------------------------------------
-- 31. Deleting a referenced Agent run is blocked (NO ACTION on review.agent_run_id)
-- ----------------------------------------------------------------------------
select throws_ok(
    $$delete from public.agent_runs where id = 'a1a1a1a1-1111-1111-1111-111111111111'$$,
    '23503',
    null,
    'deleting a referenced agent run is blocked'
);

-- ----------------------------------------------------------------------------
-- 32. Deleting a task cascades its flows, runs, decisions, and task-linked audits
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_del', '11111111-1111-1111-1111-111111111111', 'TD', 'DD', 'OD', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'task_del', '11111111-1111-1111-1111-111111111111', 1, 'execution_task_del', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
insert into public.agent_runs (id, run_key, task_id, task_flow_id, execution_id, owner_user_id, provider, run_mode, status, input_snapshot, trace_id, completed_at, normalized_output)
values ('a4a4a4a4-4444-4444-4444-444444444444', 'agent_run_task_del', 'task_del', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'execution_task_del', '11111111-1111-1111-1111-111111111111', 'openai', 'local_deterministic', 'completed', '{}'::jsonb, '00000000-0000-0000-0000-000000000004', now(), '{}'::jsonb);
insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id)
values ('task_del', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', null, '11111111-1111-1111-1111-111111111111', 'pre_launch', 'approve_recommended', 'approved', '11111111-1111-1111-1111-111111111111');
insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status)
values ('task_del', '11111111-1111-1111-1111-111111111111', 'system', 'system', 'task_created', 'Task created', 'desc', 'completed');

delete from public.tasks where id = 'task_del';

select is(
    (select count(*) from public.task_flows where task_id = 'task_del') +
    (select count(*) from public.agent_runs where task_id = 'task_del') +
    (select count(*) from public.review_decisions where task_id = 'task_del') +
    (select count(*) from public.audit_events where task_id = 'task_del'),
    0::bigint,
    'deleting a task cascades flows, runs, decisions, and task-linked audits'
);

-- ----------------------------------------------------------------------------
-- 33. Deleting an owner succeeds when the owner is also the decision actor
--     (owner_user_id cascade removes decisions before actor_user_id NO ACTION)
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_c', '33333333-3333-3333-3333-333333333333', 'TC', 'DC', 'OC', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('f1f1f1f1-0000-0000-0000-000000000000', 'task_c', '33333333-3333-3333-3333-333333333333', 1, 'execution_task_c', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
insert into public.review_decisions (task_id, task_flow_id, agent_run_id, owner_user_id, stage, action, decision_status, actor_user_id)
values ('task_c', 'f1f1f1f1-0000-0000-0000-000000000000', null, '33333333-3333-3333-3333-333333333333', 'pre_launch', 'approve_recommended', 'approved', '33333333-3333-3333-3333-333333333333');

delete from auth.users where id = '33333333-3333-3333-3333-333333333333';

select is((select count(*) from auth.users where id = '33333333-3333-3333-3333-333333333333'), 0::bigint, 'deleting owner (also actor) succeeds and cascades owner rows');

-- ----------------------------------------------------------------------------
-- 34. Task-linked audit for a deleted task is cascade-deleted
-- 35. Null-task workspace reset audit evidence is preserved after task delete
-- ----------------------------------------------------------------------------
insert into public.tasks (id, owner_user_id, title, description, expected_output, audience, sensitivity, urgency, budget_range, workflow_status, source)
values ('task_del2', '11111111-1111-1111-1111-111111111111', 'TD2', 'DD2', 'OD2', 'internal', 'low', 'medium', 'low', 'submitted', 'demo');
insert into public.task_flows (id, task_id, owner_user_id, flow_version, execution_id, analysis, recommendation, governance, execution_record, policy_version, engine_version)
values ('f0f0f0f0-0000-0000-0000-000000000000', 'task_del2', '11111111-1111-1111-1111-111111111111', 1, 'execution_task_del2', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'phase21c-governance-v1', 'phase21c-router-worker-v1');
insert into public.audit_events (task_id, owner_user_id, actor_type, actor_id, event_type, label, description, status)
values ('task_del2', '11111111-1111-1111-1111-111111111111', 'system', 'system', 'task_created', 'Task created', 'desc', 'completed');

delete from public.tasks where id = 'task_del2';

select is((select count(*) from public.audit_events where task_id = 'task_del2'), 0::bigint, 'task-linked audit for deleted task is cascade-deleted');
select is((select count(*) from public.audit_events where task_id is null and owner_user_id = '11111111-1111-1111-1111-111111111111'), 1::bigint, 'null-task workspace reset audit evidence preserved after task delete');

select finish();
rollback;
