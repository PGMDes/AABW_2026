# Phase 22 Production Pilot

## What is live in this repository

Phase 22 adds a production-pilot path for one manually created Supabase Admin.
Use `VITE_APP_RUNTIME_MODE=full_stack` only after setting the Vercel server
variables listed in `app/.env.example`. Keep `local_demo` for Vercel Preview
and offline judge demonstrations.

The full-stack application uses Supabase Auth only in the browser. All task,
attachment, analysis, governance, Live Agent, execution, outcome, and dashboard
commands go to `app/api/*`. Each endpoint verifies the Supabase JWT and requires
its subject to equal the server-only `ADMIN_USER_ID`.

## Deployment checklist

1. Create one Supabase Auth email/password user manually and copy its UUID into
   Vercel `ADMIN_USER_ID`.
2. Disable public signup in the hosted Supabase Auth dashboard. The committed
   local `supabase/config.toml` mirrors this setting for local development.
3. Apply migrations to the production Supabase project. They create the private
   `task-attachments` bucket, owner-scoped tables, RLS policies, and three
   curated execution options.
4. Configure the `SUPABASE_*`, `OPENAI_*`, and `ADMIN_USER_ID` variables in
   Vercel. Never prefix these variables with `VITE_`.
5. Configure only the browser URL and publishable key as `VITE_*` variables.
6. Set production to `VITE_APP_RUNTIME_MODE=full_stack`; keep Preview deployments
   at `local_demo` with no server secrets.

## Operational limits

- `.txt` and `.md` only; up to 5 attachments per task, 1 MB each, and 100,000
  extracted characters per task.
- A declared high-sensitivity task or detected credential/private key is blocked
  from OpenAI and must use Human or Hybrid execution.
- Live Agent has a 60-second timeout, 25 runs/day, a 10-second cooldown, and
  three attempts per task.
- OpenAI output is validated against a JSON schema. Failure records safe error
  metadata and a request ID, not raw prompt or attachment content.
- Tasks are archived first. Permanent deletion requires explicit confirmation,
  removes private Storage files, and retains a minimal non-content audit event.

## Validation

```powershell
npx supabase db reset
npx supabase test db
npm --prefix app run test:server
npm --prefix app run validate:scenarios
npm --prefix app run lint
npm --prefix app run build
```

A Phase 22 production acceptance test is complete when the configured Admin can
sign in, create a Task, upload a text file, analyze, approve, run the governed
Live Agent, select an execution option, launch, record outcome, and see the
lightweight dashboard update.
