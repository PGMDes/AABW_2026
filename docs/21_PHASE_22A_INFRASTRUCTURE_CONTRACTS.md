# Phase 22A Infrastructure Contracts

> **Status update:** this is the historical Phase 22A infrastructure snapshot. Its single-Admin authorization clauses remain the Phase 22 authorization model. Keep its trust-boundary, secret-handling, RLS, and server-revalidation principles; Phase 23 must introduce an explicit architecture amendment before adding memberships or multi-user collaboration.

## 1. Status and baseline

| Field | Recorded value |
|---|---|
| Current functional baseline | Phase 21C deterministic Router-Worker workflow |
| Approved Phase 22 plan commit | `915ab499c849f7d0bb0f799bfba210af1d30dded` - `docs: add hardened Phase 22 full-stack implementation plan` |
| Phase 22A starting HEAD | `5da8f395b77781feac36c16c22f1ebe3158dde36` - CodeGraph ignore hygiene only |
| Phase 22A scope | Architecture, infrastructure, trust, environment, test, and owner-action contracts only |
| Implementation status | Documentation and placeholder configuration prepared; no runtime implementation started |
| Vercel Root Directory gate | **Confirmed - owner Vercel Dashboard: `app`** |
| Phase 22A acceptance | Accepted after independent diff review; command override/default provenance remains a non-blocking Phase 22I deployment-QA check |

Phase 21C remains the current working product. Phase 22 is planned and approved,
but authentication, database persistence, server Functions, server-side provider
execution, and full-stack runtime modes are not implemented.

This document is the sole detailed Phase 22A source of truth. The Phase 22A
execution instruction intentionally freezes the frontend mode variable as
`VITE_APP_RUNTIME_MODE`. That name supersedes the earlier draft name
`VITE_RUNTIME_MODE` in the approved planning document for later implementation;
neither name is read by the application in Phase 22A.

## 2. Evidence register

Confidence labels:

- **Direct**: observed in Git, repository files, or a read-only platform field/log.
- **Supporting inference**: strongly indicated but not an explicit project setting.
- **Unresolved**: direct evidence is unavailable and owner confirmation is required.

| Evidence item | Source | Observation | Confidence | Implication | Unresolved question |
|---|---|---|---|---|---|
| Git baseline | Git history | Approved plan commit is present; actual starting HEAD adds only `.codegraph/.gitignore` | Direct | Phase 22A begins from the approved Phase 21C plus plan baseline | None |
| Repository application location | `app/package.json`, Vite files, README | React/Vite application and package boundary are under `app/` | Direct | `app/.env.example` belongs with the Vite application independently of future Function placement | None |
| Vercel project identity | Vercel project metadata | Project name is `aabw-2026` | Direct | Read-only evidence is for the intended deployment | None |
| Vercel framework | Vercel project metadata | `vite` | Direct | Current frontend framework is confirmed | None |
| Vercel Node version | Vercel project metadata | `24.x` | Direct | Future Functions must be compatible with Node 24.x unless a later approved phase changes it | None |
| Install command | Latest production build log | `npm install` | Direct build-log evidence | Current deployment installs from its effective project root | Whether Dashboard shows an explicit override or framework default is a non-blocking Phase 22I QA check |
| Build command | Latest production build log and `app/package.json` | `npm run build`, invoking `vite build` | Direct build-log and repository evidence | Current Vite build contract is fixed | Whether Dashboard shows an explicit override or framework default is a non-blocking Phase 22I QA check |
| Output directory | Latest production build log | `dist` | Direct build-log evidence | Current deployment emits Vite output from its effective project root | Whether Dashboard shows an explicit override or framework default is a non-blocking Phase 22I QA check |
| Development command | `app/package.json` | `npm run dev`, invoking `vite` | Direct repository evidence | Local Vite development contract is fixed | Whether Dashboard shows an explicit override or framework default is a non-blocking Phase 22I QA check |
| Root Directory | Owner manual Vercel Dashboard confirmation | `app` | Direct | Vercel resolves project-relative paths from `app/`; future Functions belong under `app/api/` | None for Phase 22A |
| Owner Dashboard confirmation | Owner, Vercel Dashboard -> `aabw-2026` -> Settings -> General | Root Directory confirmed as `app` | Direct manual read-only evidence | Hard Gate A is closed without changing an external resource | Command override/default provenance remains a Phase 22I deployment-QA check |
| Supabase project status | Supabase read-only project metadata | `ACTIVE_HEALTHY` | Direct | Use the existing project; do not create another one | None |
| Supabase region | Supabase read-only project metadata | `ap-northeast-2` | Direct | Region is recorded without project reference or credentials | None |
| PostgreSQL major version | Supabase read-only project metadata | `17` | Direct | Later schema work targets the existing PostgreSQL 17 project | None |

No project reference, project URL, database hostname, key, token, connection
string, or credential is recorded in this document.

## 3. Final target architecture

```text
Browser
  |
  | Supabase Auth session
  | read-only authorized data queries where explicitly allowed
  | protected requests carrying user access token
  v
Vercel Node Functions
  |
  | authoritative user verification
  | ADMIN_USER_ID gate
  | request validation
  | deterministic policy recomputation
  | server-controlled database writes
  | server-controlled provider calls
  v
Supabase Postgres + Auth
  |
  | owner-scoped RLS
  | durable workflow records
  | review decisions
  | Agent runs
  | audit evidence
  v
OpenAI Responses API
  |
  | bounded approved work execution only
  v
Human output review
```

The model never controls route recommendation, governance, blocked status,
Human review requirements, execution eligibility, final approval, or audit
policy. Those decisions remain deterministic and outside provider output.

## 4. Deployment-root decision

**Decision status: CONFIRMED - owner Vercel Dashboard: Root Directory `app`.**

The owner directly confirmed the active Root Directory in the Vercel Dashboard.
The Vercel project API continues to corroborate framework `vite` and Node `24.x`.
No local `.vercel/project.json` or `vercel.json` exists. Production logs remain
supporting evidence for the effective Vite install, build, and output behavior.

| Setting | Current evidence | Gate status |
|---|---|---|
| Root Directory | Owner Dashboard confirmation: `app` | Confirmed |
| Future Function location | `app/api/` | Fixed; do not create the directory in Phase 22A |
| Install command | `npm install` | Effective setting confirmed; override/default provenance is a non-blocking Phase 22I QA check |
| Build command | `npm run build`, invoking `vite build` | Effective setting confirmed; override/default provenance is a non-blocking Phase 22I QA check |
| Output directory | `dist` | Effective setting confirmed; override/default provenance is a non-blocking Phase 22I QA check |
| Development command | `npm run dev`, invoking `vite` | Effective setting confirmed; override/default provenance is a non-blocking Phase 22I QA check |
| Node.js runtime | `24.x` from Vercel project metadata | Confirmed |
| Future setting change expected | None is authorized or recommended in Phase 22A | No change expected |

The effective command values are sufficient for Phase 22A. Phase 22I deployment
QA must record whether each Vercel command field is an explicit override or a
blank/framework default. That provenance check is non-blocking and does not
authorize any setting change.

The current frontend deployment must not be disrupted because it is the approved
judge-facing Phase 21C baseline. No Function directory is created in Phase 22A,
and no root, command, output, framework, or runtime setting is changed.

## 5. Runtime modes

Phase 22 defines exactly two deployment/build modes. Mode handling is not
implemented in Phase 22A.

### `local_demo`

- deterministic browser-local demonstration;
- offline scenario validation and reliable fallback;
- no claim of backend persistence;
- no real protected provider execution;
- existing source-controlled scenarios and local state remain authoritative.

### `full_stack`

- authenticated Admin;
- durable workflow records;
- server-authorized writes;
- protected real Agent execution;
- server-held secrets;
- durable review and audit evidence.

The build-time frontend variable is:

```text
VITE_APP_RUNTIME_MODE
```

Allowed future values are `local_demo` and `full_stack`.

Mode rules:

- Modes are build/deployment configuration, not user preferences.
- No query parameter, URL fragment, localStorage value, form field, API request
  field, or public UI toggle may switch modes.
- A deployed `full_stack` build fails closed when required configuration is
  missing. It never silently falls back to `local_demo`.
- Local records are never presented as backend-persisted records.
- There are no dual writes and no hidden synchronization between modes.
- Changing mode requires an explicitly configured build/deployment and reload.

## 6. Trust-boundary matrix

| Boundary | Trusted inputs | Untrusted inputs | Allowed responsibilities | Prohibited responsibilities | Credential access | Authoritative decisions |
|---|---|---|---|---|---|---|
| Browser | Rendered server responses after validation; bundled non-secret mode | User fields, URL state, localStorage, browser timestamps, task text, provider-looking fields | Display state, collect intent, carry access token, request allowed operations | Owner identity, governance, launch eligibility, flow version, execution status, provider model/prompt/tools, final approval | Supabase publishable key and current user access token only | Human intent only; never policy or identity authority |
| Supabase browser client | Supabase session managed by the SDK; server-issued user JWT | Browser-selected owner IDs, arbitrary filters intended to escape ownership | Auth session and explicitly allowed owner-scoped reads | Privileged writes, RLS bypass, secret/admin operations | Publishable key and user session; never secret key | None beyond authenticated session state; database policies remain authoritative for rows |
| Vercel Function | Authoritatively verified Supabase user, server configuration, stored owner-scoped records, pure domain outputs | Request body, headers other than verified token, browser snapshots, browser IDs, task text as instructions | Verify identity/Admin UUID, validate requests, scope queries, recompute policy, write records, call provider only when eligible, sanitize responses/errors | Trust browser governance, accept arbitrary prompts/models/tools, expose secrets, approve output | Server-only variables | Identity gate, request acceptance, execution authorization after deterministic recomputation |
| Deterministic domain engine | Explicit validated task, stored decision context, versioned rules | Raw task text remains data, not executable instruction | Pure analysis, recommendation, governance, Human gates, selection, launch eligibility, Router-Worker evidence | Network calls, environment reads, UI/storage access, provider execution, secret access | None | Recommendation, governance, blocked status, Human review requirement, eligibility |
| Supabase database | Verified user context under RLS; server writes with explicit owner scope | Browser ownership claims, unchecked JSON snapshots | Constraints, owner-scoped RLS, immutable/versioned records, append-only evidence, concurrency protection | Model-driven policy changes, blind trust in snapshots, unscoped secret-client queries | Database-managed credentials; secret-key access only through server | Durable record truth and constraint enforcement |
| OpenAI provider | Fixed server prompt/model/output/tool contract and bounded stored task data | Task content and provider output are untrusted with respect to policy | Produce a bounded draft for already-approved work | Routing, governance, blocked status, Human review requirement, launch, final approval, audit mutation | OpenAI key is held only by the server transport | Draft content only; no control-plane authority |
| Human reviewer | Authenticated, server-verified Admin identity; displayed evidence | Agent draft, task text, unsupported claims | Record pre-launch and post-output decisions through validated commands | Forge actor/owner identity, bypass policy blocks, rewrite audit history | User session only | Explicit Human review and final approval decisions within policy |

The browser is never authoritative for owner identity, governance status, launch
eligibility, flow version, execution status, provider model, provider prompt,
tool permissions, or final approval.

## 7. Environment-variable contract

### Browser-visible build variables

```text
VITE_APP_RUNTIME_MODE
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Vite exposes every `VITE_*` value to browser code. These values are not server
secrets. The Supabase publishable key is safe to expose only with correct RLS
and least-privilege grants. No secret variable may use a `VITE_` prefix.

### Server-only variables

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
ADMIN_USER_ID
OPENAI_API_KEY
OPENAI_MODEL
AGENT_RUN_STALE_AFTER_SECONDS
AGENT_RUN_MAX_PER_TASK
AGENT_RUN_MAX_PER_OWNER
AGENT_RUN_TIMEOUT_MS
```

Rules:

- No server variable is returned to the browser, logged, stored in localStorage,
  or committed.
- `ADMIN_USER_ID` is the verified Supabase Auth UUID, never an email address.
- `OPENAI_MODEL` remains unresolved until Phase 22E.
- Numerical run-control values remain unresolved until Phase 22G.
- Secrets are configured independently for local, preview, and production
  environments.
- Additional variables require a documented purpose, exposure classification,
  owning subphase, and validation rule.

`app/.env.example` contains placeholders only. It belongs under `app/` because
`app` is the confirmed Vercel project Root Directory and the Vite package
boundary. The future Function location is fixed as `app/api/`, but that directory
is not created during Phase 22A.

## 8. Environment matrix

| Environment | Runtime mode | Supabase environment | OpenAI key scope | Admin identity | Expected data isolation | Live provider allowed | Configured by | Currently configured |
|---|---|---|---|---|---|---|---|---|
| Local deterministic development | `local_demo` | None required | None | None | Browser-local only; no backend claim | No protected live execution | Developer | Current deterministic behavior exists; mode variable is not implemented |
| Local full-stack development | `full_stack` | Controlled development credentials for the selected project/environment | Development-only key and controls | Manually approved development Admin UUID | Development data must not be represented as production | Only after Phase 22E and explicit setup | Owner/developer privately | No |
| Vercel Preview | `full_stack` when implemented | Must not write production data; exact Supabase isolation decision remains a 22I gate | Preview-specific budget/rate controls | Preview-approved Admin UUID | Preview isolated from production writes | Only after Phase 22E and 22I approval | Owner in Vercel/provider dashboards | No full-stack configuration is confirmed |
| Vercel Production | `full_stack` when implemented | Judge demo environment; separation design finalized in 22I | Production-specific budget/rate controls | Production Admin UUID | Production judge records | Only after preview evidence and production approval | Owner in Vercel/provider dashboards | Current production is the frontend demo, not Phase 22 full stack |

Safe minimums:

- Local deterministic mode requires no external credentials.
- Local full-stack mode uses controlled development credentials.
- Preview must not write production data.
- Production uses the judge demo environment.
- Preview and production use separate OpenAI budget controls.
- Separate Supabase infrastructure is preferred but not claimed as implemented;
  the final preview/production isolation decision remains a Phase 22I gate.

## 9. Supabase contract

- Use the existing `ACTIVE_HEALTHY` project in `ap-northeast-2`; do not create a
  second project now.
- Target PostgreSQL major version 17 as observed.
- Use modern publishable/secret key terminology. Publishable keys are for public
  clients; secret keys are backend-only and bypass RLS.
- Use Supabase Auth email/password for one manually created Admin.
- Disable public signup before accepting the full-stack login flow.
- Apply owner-scoped RLS and least-privilege grants to browser-visible data.
- Treat grants and RLS as separate controls.
- Route security-sensitive writes through authenticated server Functions.
- Minimize secret-key use because it bypasses RLS.
- Prefer verified user-scoped access for normal user-context operations.
- Reserve secret/admin access for narrowly justified, explicitly owner-scoped
  operations.
- Create no schema, SQL, migration, policy, user, or Auth setting in Phase 22A.
- Detailed SQL remains owned by Phase 22B.

## 10. Vercel Function contract

Future Node Functions must meet all of these requirements:

- Directory is `app/api/`, resolved from the confirmed Vercel Root Directory.
- ESM with explicit `.js` relative imports.
- JSON request and response bodies.
- Allowed-method checks.
- Content-Type and request-size validation.
- Bearer-token verification through authoritative Supabase user verification.
- Exact server-only Admin UUID gate.
- Server-side deterministic policy recomputation.
- Fixed server model.
- No arbitrary browser prompt or browser-selected tools.
- Sanitized errors and no secret logging.
- No provider call before every identity, ownership, version, governance, review,
  eligibility, concurrency, and run-limit check passes.
- Compatibility with the confirmed Vercel Node runtime.

No Function implementation or Function directory exists in Phase 22A.

## 11. Shared deterministic-domain contract

Future server-importable domain modules must:

- be pure JavaScript ESM;
- use explicit `.js` extensions for relative imports;
- not import React, JSX, or UI components;
- not access `window`, `document`, or `localStorage`;
- not call browser `fetch` implicitly;
- not read environment variables directly;
- accept explicit inputs;
- return serializable deterministic outputs.

Browser, database, Vercel, and provider adapters may wrap this pure layer. No
module is moved, rewritten, or duplicated in Phase 22A.

## 12. Data-authority contract

- `tasks` is the authoritative task input in full-stack mode.
- Immutable `task_flows` records are versioned evidence, not blindly trusted
  authorization objects.
- Pre-launch and post-output decisions are separate immutable records.
- Agent runs are separate execution records.
- Audit events are append-only evidence.
- Domain task, execution, run, and Router-Worker identifiers remain text where
  the current domain creates or consumes them.
- Database row IDs, Supabase owner/user/reviewer IDs, and trace IDs may be UUIDs.
- `audit_events.actor_id` remains text because actors can be Human, system,
  Agent, or provider identities.
- The current snapshot is the owner-scoped row with the greatest
  `flow_version` for the task.
- Server execution fails closed if stored evidence cannot be recomputed or does
  not match supported engine/policy contracts.
- The browser never selects a flow version or supplies authoritative snapshots.
- JSON snapshots are evidence and display material, not independent authority.

The approved identifier matrix in
`docs/20_PHASE_22_FULLSTACK_IMPLEMENTATION_PLAN.md` remains the detailed source
for mapping `tasks.id` text, `task_flows.execution_id` text,
`agent_runs.id` UUID, domain `agent_runs.run_key` text, provider
`agent_runs.provider_run_id` text, Supabase owner/user/reviewer UUIDs, and
Router-Worker text identifiers. Phase 22A does not create this schema.

## 13. Phase ownership matrix

| Phase | Exclusive implementation ownership |
|---|---|
| 22B | Schema, constraints, grants, RLS, migrations, database tests |
| 22C | Authentication, manually approved Admin session, exact Admin gate |
| 22D | Persistence adapters and validated durable writes |
| 22E | Server-enforced real Agent and provider contract |
| 22F | Durable Human output review and audit lifecycle |
| 22G | Reset, run limits, stale recovery, concurrency and cost controls |
| 22H | Product presentation of accepted full-stack behavior |
| 22I | Preview, production, QA, isolation decisions, submission evidence |

Phase 22A implements none of the responsibilities above.

## 14. Test contract

Later subphases must add tests at the layer they implement:

- pure Node domain-import test without React, DOM, Vite, storage, or environment
  dependencies;
- schema and clean-migration tests;
- pgTAP constraints, grants, and RLS tests;
- anonymous-access denial;
- authenticated owner access;
- two-user cross-owner isolation;
- RLS `USING` and `WITH CHECK` behavior;
- API method, Content-Type, size, body, ID, and relationship validation;
- valid user whose UUID differs from `ADMIN_USER_ID` receives `403`;
- blocked, pending-review, stale, wrong-owner, or mismatched paths make zero
  provider calls;
- concurrent active-run reservation and duplicate prevention;
- stale-run recovery and reset serialization;
- deterministic provider fixtures for normal automation;
- one owner-controlled live smoke test outside normal automation.

Mandatory Antigravity review requirements:

1. Phase 22B pgTAP tests must prove anonymous users receive no rows and lack
   unauthorized table access.
2. Phase 22D flow-version allocation must lock the parent task row using
   `SELECT ... FOR UPDATE` before calculating
   `coalesce(max(flow_version), 0) + 1`.

Phase 22A documents these tests only.

## 15. Manual owner actions

### Phase 22A

1. Owner Dashboard confirmation completed: Root Directory is `app`.
2. 2. Independent diff review completed; infrastructure contract approved.

### Later phases

- Configure approved Supabase project settings.
- Disable public signup.
- Manually create the single Admin.
- Configure local, preview, and production environment variables privately.
- Approve migrations before application.
- Approve preview deployment before mutation.
- Approve production deployment separately after preview evidence.
- Distribute judge credentials privately.
- During Phase 22I deployment QA, record whether Vercel command values are
  explicit overrides or blank/framework defaults; do not alter settings merely
  to resolve that documentation provenance.

The owner must never paste secrets into chat, documentation, source code, GitHub
issues, pull requests, or other review artifacts.

## 16. Plugin action register

All external operations in Phase 22A were read-only. No external resource was
created, updated, deleted, deployed, or reconfigured.

| Plugin/surface | Operation | Classification | Purpose | Sanitized result | Resource changed? |
|---|---|---|---|---|---|
| Vercel | List teams | Read-only | Discover the account scope needed to inspect the project | One accessible account scope found | No |
| Vercel | List projects | Read-only | Locate `aabw-2026` without relying on local link files | Project found | No |
| Vercel | Get project | Read-only | Inspect project identity, framework, Node version, deployment metadata | `aabw-2026`, Vite, Node `24.x`, ready production deployment; Root Directory and command fields omitted | No |
| Vercel | Get deployment build logs | Read-only | Verify install/build/output behavior | `npm install`, Vite build, `dist/index.html`, successful output deployment | No |
| Vercel | Search official documentation | Read-only | Confirm project metadata supports a `rootDirectory` setting and current project-setting concepts | Official API documentation includes Root Directory and command fields | No |
| Browser - Vercel Dashboard | Navigate to project General settings | Read-only | Attempt preferred direct Root Directory evidence | Redirected to Vercel login; no setting viewed | No |
| Supabase | List projects | Read-only | Confirm an existing project is available and avoid duplicate creation | One existing active project found | No |
| Supabase | Get project | Read-only | Confirm non-secret status, region, and PostgreSQL version | `ACTIVE_HEALTHY`, `ap-northeast-2`, PostgreSQL major 17 | No |
| Supabase | Search official documentation | Read-only | Verify current publishable/secret key and RLS guidance | Publishable keys are public/low privilege; secret keys are backend-only and bypass RLS; RLS and least-privilege grants are required | No |

Identifiers, URLs, hostnames, tokens, connection strings, and key values returned
by tools are intentionally omitted.

## 17. Acceptance checklist

- [x] Phase 21C functional baseline and approved Phase 22 plan commit recorded.
- [x] Exact Vercel Root Directory directly confirmed as `app` by the owner.
- [x] Future Function location fixed as `app/api/`; directory not created.
- [ ] Phase 22I deployment QA records exact Dashboard command override/default provenance; non-blocking for Phase 22A.
- [x] Effective install, build, output, and repository development behavior recorded with evidence confidence.
- [x] Vercel Node runtime recorded.
- [x] Existing Supabase project status, region, and PostgreSQL major version recorded without secrets.
- [x] Environment-variable exposure contracts complete.
- [x] Runtime modes are mode-exclusive and fail closed.
- [x] Trust boundaries and authoritative decisions are explicit.
- [x] No runtime code changed.
- [x] No dependency installed.
- [x] No API directory created.
- [x] No external resource changed.
- [x] No credential committed.
- [x] Regression validation completed for this diff.
- [x] Independent review approves the diff.

**Phase 22A status: ACCEPTED.** Root Directory `app` is confirmed and the future
Function location is fixed as `app/api/`. Command override/default provenance
remains a non-blocking Phase 22I deployment-QA check. Phase 22B may begin only
under a separate approved implementation prompt.