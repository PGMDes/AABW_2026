# AGENTS.md

## Purpose

This repository is for building `SymbiontOS` inside the `AABW_2026` project folder.

This file tells future AI coding agents how to work in this repo without re-opening core product strategy decisions that are already locked.

The user is a vibe-coding beginner. Write and explain changes in a way that is easy to follow. Do not assume deep knowledge of software architecture, system design, or engineering jargon.

## Source of truth read order

When starting a new task, AI agents should read these files in this order:

1. `AGENTS.md`
2. `docs/00_PRODUCT_SPEC.md`
3. `docs/01_MVP_BUILD_PLAN.md`
4. Any file directly related to the current task

If a later file conflicts with `AGENTS.md`, follow `AGENTS.md` unless the user explicitly says the project direction has changed.

---

## Locked product direction

These decisions are already made. Do not restart product strategy, reframe the MVP, or replace the product thesis unless the user explicitly asks to change it.

### Product
- `SymbiontOS`

### V1 approach
- `Decision-first workforce control plane`

### Primary user
- `Innovation / AI transformation lead`

### Near-term deployment target
- A real hosted product for an initial group of roughly `100 users`
- Real user identities must come from authentication, never hardcoded sample names
- Until authentication is implemented, local demo surfaces should use neutral role labels such as `Workspace administrator`

### First task category
- `Knowledge work`

### Core purpose
- Recommend whether a task should be done by a `human`, an `AI agent`, or a `hybrid human-agent team`

### Core flow
- `Submit task`
- `Analyze task`
- `Recommend human / agent / hybrid`
- `Explain why`
- `Apply governance`
- `Select execution option`
- `Launch`
- `Track outcome`

### V1 includes
- `Task intake`
- `Decision engine`
- `Explainability`
- `Curated marketplace`
- `Governance flow`
- `Lightweight execution tracker`

### V1 does not include
- Full HR system
- Full project management system
- Full open marketplace
- Full agent builder
- Monetization
- Complex enterprise compliance

If a task would push the codebase beyond these boundaries, treat that as a scope change and call it out clearly before proceeding.

---

## Core working rules

### 1. Do not restart strategy
Do not re-argue the product vision, invent a new target user, or propose a different MVP shape unless the user explicitly requests a product change.

Good:
- Extend the current MVP
- Clarify implementation details
- Break the locked scope into smaller build steps

Not good:
- “Maybe this should really be a recruiting platform”
- “Let’s pivot to a general AI workflow builder”
- “We should redesign the MVP around analytics first”

### 2. Preserve the locked MVP
When making product or engineering choices, prefer the option that strengthens the current V1:
- trusted decisioning
- explainable recommendations
- lightweight governance
- curated execution options
- minimal but usable outcome tracking

### 3. Ask only blocking questions
Do not ask the user unnecessary preference questions.

Ask a question only if:
- a missing answer would materially change the implementation
- a required path, secret, API, or environment detail is unavailable
- two choices would lead to different code structures and neither is clearly better from the current repo context

Otherwise:
- make a reasonable assumption
- state the assumption clearly
- proceed

### 4. Prefer small, buildable steps
Work in narrow vertical slices that can be explained, reviewed, and tested.

Prefer:
- one screen before five screens
- one API route before a full platform
- one decision path before a fully generalized rules engine
- one working marketplace flow before a large ecosystem abstraction

Avoid broad rewrites when a focused change will do.

### 5. Explain assumptions at beginner level
The user may not know why a change is needed. When making decisions, explain them simply.

Good example:
- “I used a separate file for recommendation logic so it stays easier to test and change later.”

Bad example:
- “I extracted a domain-oriented orchestration boundary to improve separation of concerns.”

Use plain language first. Technical depth is optional, not the default.

### 6. Update docs when scope or behavior changes
If you change:
- scope
- user flow
- data model
- recommendation logic
- governance behavior
- setup steps
- architecture in a meaningful way

Then update the relevant docs in the same task.

Do not let code and docs drift apart.

---

## How to make decisions in this repo

When unsure between multiple implementation choices, prefer the option that is:

1. Easier for a beginner to understand
2. Smaller and faster to validate
3. Easier to test
4. Consistent with the locked MVP
5. Easier to change later without a rewrite

If a “clever” design makes the project harder to understand, do not use it unless there is a clear need.

---

## Expected implementation style

### Build vertical slices
Prefer features that connect end to end, even if simple.

Example of a good slice:
- basic task intake form
- task analysis function
- recommendation result
- explanation panel
- simple governance check
- manual launch action
- outcome record

This is better than building isolated infrastructure with no visible workflow.

### Keep modules focused
Each module should have one clear job.

Examples:
- task intake handling
- recommendation scoring
- policy evaluation
- marketplace lookup
- execution tracking

Avoid giant files that mix UI, business rules, and storage logic together.

### Start simple, then refine
For V1, prefer explicit and inspectable logic over smart-but-opaque systems.

Examples:
- simple scoring over black-box recommendation logic
- rule-based governance over auto-learning policy behavior
- curated agent records over dynamic marketplace ingestion

### Preserve explainability
Any recommendation feature should make it easy to answer:
- Why was this route chosen?
- Why was another route not chosen?
- What conditions or risks affected the decision?
- What would require human approval?

If a code change makes this harder to explain, reconsider it.

---

## Questions policy for coding agents

Before asking the user anything, check whether the question is truly blocking.

### Ask if blocking
Examples:
- missing environment variable or API key
- unknown database choice when the repo does not already establish one
- a file path the task depends on does not exist
- the user must choose between two different product behaviors that would change the MVP flow

### Do not ask if non-blocking
Examples:
- naming preferences
- minor UI styling preferences
- internal refactor style
- whether to use one reasonable helper function or another
- whether to add basic validation or logging

If not blocking:
- choose the sensible default
- say what you chose
- continue

---

## Communication style

When reporting work:
- say what you changed
- say why
- say any assumption you made
- say what the user should review next

Keep explanations short and clear.

Good format:
- `What I changed`
- `Why`
- `Assumptions`
- `Next thing to test or review`

Avoid long theory unless the user asks for it.

---

## Documentation expectations

When relevant, keep these kinds of docs updated:
- setup instructions
- feature behavior notes
- architecture notes
- MVP scope notes
- decision logic docs
- governance rules docs

If a task changes product behavior, update documentation in the same change set.

If a task might change the locked MVP, stop and explicitly tell the user that it is a scope change.

---

## Scope control rules

Treat the following as out of scope unless the user explicitly requests an expansion:
- full employee management
- recruiting workflows
- enterprise-grade compliance programs
- broad workflow automation suites
- open agent publishing platforms
- subscription billing
- monetization systems
- advanced analytics platforms beyond lightweight outcome tracking
- generalized multi-tenant enterprise architecture unless needed by the current codebase

When a task drifts toward these areas:
- say it is outside V1
- suggest the smallest V1-compatible version
- continue only if the user confirms the expansion

---

## Practical coding behavior

### Before coding
- Read the existing code and docs first
- Follow established patterns where reasonable
- Check whether the task fits the locked MVP
- Break work into the smallest useful implementation step

### While coding
- Keep changes local and understandable
- Prefer explicit naming
- Add validation where it prevents obvious mistakes
- Avoid unnecessary abstractions
- Keep recommendation and policy logic easy to inspect

### After coding
- Verify the feature works
- Check whether docs need updating
- Explain any assumptions made
- Call out any remaining limitations clearly

---

## Preferred mindset

Act like a practical teammate helping a beginner ship a real MVP.

That means:
- protect the locked product direction
- keep scope under control
- build small, real, testable increments
- explain decisions simply
- ask only when blocked
- keep docs aligned with the code

If you follow this file well, the repo should move forward without repeated strategy resets or unnecessary complexity.
