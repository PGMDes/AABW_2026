-- ============================================================================
-- Phase 22B.2 - Schema, column types, privileges, and policy tests
-- ----------------------------------------------------------------------------
-- Verifies the five Phase 22B tables exist, RLS is enabled on each, the
-- identifier contract types are correct, anon has no table privileges,
-- authenticated has SELECT only (no write/TRUNCATE/REFERENCES/TRIGGER), and
-- all five owner-select policies exist.
--
-- Uses only built-in pgTAP and PostgreSQL catalog functions. No credentials.
-- All checks are read-only against the schema applied by the migration.
-- ============================================================================
begin;

select plan(43);

-- ----------------------------------------------------------------------------
-- 1. All five tables exist
-- ----------------------------------------------------------------------------
select has_table('public', 'tasks', 'table tasks exists');
select has_table('public', 'task_flows', 'table task_flows exists');
select has_table('public', 'agent_runs', 'table agent_runs exists');
select has_table('public', 'review_decisions', 'table review_decisions exists');
select has_table('public', 'audit_events', 'table audit_events exists');

-- ----------------------------------------------------------------------------
-- 2. RLS is enabled on all five tables
-- ----------------------------------------------------------------------------
select is(
    (select c.relrowsecurity from pg_class c join pg_namespace n on c.relnamespace = n.oid
     where n.nspname = 'public' and c.relname = 'tasks'),
    true,
    'RLS is enabled on tasks'
);
select is(
    (select c.relrowsecurity from pg_class c join pg_namespace n on c.relnamespace = n.oid
     where n.nspname = 'public' and c.relname = 'task_flows'),
    true,
    'RLS is enabled on task_flows'
);
select is(
    (select c.relrowsecurity from pg_class c join pg_namespace n on c.relnamespace = n.oid
     where n.nspname = 'public' and c.relname = 'agent_runs'),
    true,
    'RLS is enabled on agent_runs'
);
select is(
    (select c.relrowsecurity from pg_class c join pg_namespace n on c.relnamespace = n.oid
     where n.nspname = 'public' and c.relname = 'review_decisions'),
    true,
    'RLS is enabled on review_decisions'
);
select is(
    (select c.relrowsecurity from pg_class c join pg_namespace n on c.relnamespace = n.oid
     where n.nspname = 'public' and c.relname = 'audit_events'),
    true,
    'RLS is enabled on audit_events'
);

-- ----------------------------------------------------------------------------
-- 3. Identifier contract column types
--    tasks.id and every task_id / execution_id column must be text.
--    agent_runs.id is uuid; run_key and provider_run_id are text.
--    audit_events.actor_id is text. Owner/actor/trace columns are uuid.
-- ----------------------------------------------------------------------------
select col_type_is('public', 'tasks', 'id', 'text', 'tasks.id is text');
select col_type_is('public', 'tasks', 'owner_user_id', 'uuid', 'tasks.owner_user_id is uuid');

select col_type_is('public', 'task_flows', 'id', 'uuid', 'task_flows.id is uuid');
select col_type_is('public', 'task_flows', 'task_id', 'text', 'task_flows.task_id is text');
select col_type_is('public', 'task_flows', 'execution_id', 'text', 'task_flows.execution_id is text');

select col_type_is('public', 'agent_runs', 'id', 'uuid', 'agent_runs.id is uuid');
select col_type_is('public', 'agent_runs', 'task_id', 'text', 'agent_runs.task_id is text');
select col_type_is('public', 'agent_runs', 'execution_id', 'text', 'agent_runs.execution_id is text');
select col_type_is('public', 'agent_runs', 'run_key', 'text', 'agent_runs.run_key is text');
select col_type_is('public', 'agent_runs', 'provider_run_id', 'text', 'agent_runs.provider_run_id is text');

select col_type_is('public', 'review_decisions', 'task_id', 'text', 'review_decisions.task_id is text');

select col_type_is('public', 'audit_events', 'task_id', 'text', 'audit_events.task_id is text');
select col_type_is('public', 'audit_events', 'actor_id', 'text', 'audit_events.actor_id is text');

-- ----------------------------------------------------------------------------
-- 4. anon has no table privileges on any of the five tables
--    Counts how many of the seven table privileges anon holds; expects zero.
-- ----------------------------------------------------------------------------
select is(
    (select count(*) from (values ('select'), ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('anon', 'public.tasks', v.p)),
    0::bigint,
    'anon has no privileges on tasks'
);
select is(
    (select count(*) from (values ('select'), ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('anon', 'public.task_flows', v.p)),
    0::bigint,
    'anon has no privileges on task_flows'
);
select is(
    (select count(*) from (values ('select'), ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('anon', 'public.agent_runs', v.p)),
    0::bigint,
    'anon has no privileges on agent_runs'
);
select is(
    (select count(*) from (values ('select'), ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('anon', 'public.review_decisions', v.p)),
    0::bigint,
    'anon has no privileges on review_decisions'
);
select is(
    (select count(*) from (values ('select'), ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('anon', 'public.audit_events', v.p)),
    0::bigint,
    'anon has no privileges on audit_events'
);

-- ----------------------------------------------------------------------------
-- 5. authenticated has SELECT only on each table
-- ----------------------------------------------------------------------------
select ok(has_table_privilege('authenticated', 'public.tasks', 'select'),
          'authenticated has SELECT on tasks');
select ok(has_table_privilege('authenticated', 'public.task_flows', 'select'),
          'authenticated has SELECT on task_flows');
select ok(has_table_privilege('authenticated', 'public.agent_runs', 'select'),
          'authenticated has SELECT on agent_runs');
select ok(has_table_privilege('authenticated', 'public.review_decisions', 'select'),
          'authenticated has SELECT on review_decisions');
select ok(has_table_privilege('authenticated', 'public.audit_events', 'select'),
          'authenticated has SELECT on audit_events');

-- ----------------------------------------------------------------------------
-- 6. authenticated has no INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER
--    Counts how many of those six write privileges authenticated holds;
--    expects zero on every table.
-- ----------------------------------------------------------------------------
select is(
    (select count(*) from (values ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('authenticated', 'public.tasks', v.p)),
    0::bigint,
    'authenticated has no write privileges on tasks'
);
select is(
    (select count(*) from (values ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('authenticated', 'public.task_flows', v.p)),
    0::bigint,
    'authenticated has no write privileges on task_flows'
);
select is(
    (select count(*) from (values ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('authenticated', 'public.agent_runs', v.p)),
    0::bigint,
    'authenticated has no write privileges on agent_runs'
);
select is(
    (select count(*) from (values ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('authenticated', 'public.review_decisions', v.p)),
    0::bigint,
    'authenticated has no write privileges on review_decisions'
);
select is(
    (select count(*) from (values ('insert'), ('update'), ('delete'),
                           ('truncate'), ('references'), ('trigger')) as v(p)
     where has_table_privilege('authenticated', 'public.audit_events', v.p)),
    0::bigint,
    'authenticated has no write privileges on audit_events'
);

-- ----------------------------------------------------------------------------
-- 7. All five owner-select policies exist
-- ----------------------------------------------------------------------------
select is(
    (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'tasks'
       and policyname = 'tasks_owner_select'),
    1::bigint,
    'policy tasks_owner_select exists'
);
select is(
    (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'task_flows'
       and policyname = 'task_flows_owner_select'),
    1::bigint,
    'policy task_flows_owner_select exists'
);
select is(
    (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'agent_runs'
       and policyname = 'agent_runs_owner_select'),
    1::bigint,
    'policy agent_runs_owner_select exists'
);
select is(
    (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'review_decisions'
       and policyname = 'review_decisions_owner_select'),
    1::bigint,
    'policy review_decisions_owner_select exists'
);
select is(
    (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'audit_events'
       and policyname = 'audit_events_owner_select'),
    1::bigint,
    'policy audit_events_owner_select exists'
);

select finish();
rollback;
