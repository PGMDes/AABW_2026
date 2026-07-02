# Human-AgentOS Task Routing Design

Date: 2026-07-03
Status: Approved for planning
Product slice: Decision-first workforce control plane for knowledge work
Primary user: Innovation / AI transformation lead

## Purpose

This document defines the first product slice for Human-AgentOS: a system that helps an organization decide whether a knowledge-work task should be performed by a human, an AI agent, or a human-agent team, then route that work through minimal governance and launch it through a curated agent marketplace.

The goal of this slice is to help organizations access the right capability in minutes instead of weeks while maintaining trust, governance, and clear reasoning behind every decision.

## Problem to solve

Organizations are adopting AI agents alongside human workers, but they do not have a unified way to:

- decide who or what should do a task
- understand when an AI agent is appropriate
- combine humans and agents safely
- enforce governance and approval requirements
- evaluate which agents are suitable for a task
- measure whether the chosen execution path was effective

Current tooling is fragmented across recruiting systems, project management tools, workflow software, and AI applications. The result is slow staffing, inconsistent agent selection, weak governance, and poor visibility into workforce decisions.

## First-release scope

The first release is intentionally narrow. It is a decision-first workforce control plane for knowledge work.

It is in scope to:

- accept a structured work request
- recommend `human`, `agent`, or `hybrid`
- explain why that recommendation was made
- show eligible curated agents for the task
- enforce policy-based approval and governance
- launch work in a lightweight way
- track outcome and review whether the recommendation was good

It is not in scope to:

- be a full recruiting or HR platform
- be a full human talent marketplace
- be a full project management or workflow suite
- be an open agent publishing ecosystem
- autonomously optimize decisions with opaque models

## Product boundary

The product boundary for v1 is a trusted decision and control layer, not a complete execution platform. The product should own intake, classification, recommendation, policy checks, approval, launch, and outcome capture. It should not try to absorb every downstream execution workflow into the platform.

This keeps the wedge clear:

`submit task -> get recommendation -> understand why -> review eligible options -> approve if needed -> launch -> track outcome`

## Primary user and context

The first release is optimized for an innovation or AI transformation lead. This user cares less about generic staffing operations and more about:

- where agents can safely be introduced
- how agent decisions can be explained
- whether governance is predictable
- which agents are credible and approved
- how to prove value without losing control

This means the product must optimize for trust, explainability, and controlled adoption more than maximum automation.

## Success criteria

The first release is a balanced proof across three areas:

1. Faster decisions
   Users can submit work and quickly get a credible recommendation for human, agent, or hybrid execution.
2. Safer adoption
   Approval gates and policy rules make agent use predictable and auditable.
3. Better agent selection
   A curated marketplace provides enough evaluation detail to choose an agent confidently.

## Task focus

The first release should handle knowledge-work tasks best. Representative tasks include:

- research briefs
- summarization
- drafting
- analysis
- documentation
- competitive reviews
- internal reporting

This focus makes recommendation logic easier to explain and creates a practical space where human, agent, and hybrid paths all make sense.

## Recommended product approach

Three approaches were considered:

1. Decision-first platform
2. Marketplace-first platform
3. Workflow-first platform

The chosen direction is the decision-first platform with a curated marketplace and minimal workflow support.

This approach best supports the core product promise: trusted decisioning plus controlled deployment. It avoids becoming just an agent directory or a general work-management tool.

## Core product surfaces

The first release should include five visible product surfaces and one supporting service:

### 1. Task intake

Collects:

- task description
- expected outcome
- deadline
- audience
- sensitivity level
- urgency
- budget range
- required review level
- supporting context

The intake must combine free text with structured fields. Structured inputs are necessary to make recommendations explainable and auditable.

### 2. Decision engine

Evaluates whether the task is best suited to `human`, `agent`, or `hybrid` execution. It should return a ranked recommendation and not only a single winner.

### 3. Explainability layer

Shows the user why a recommendation was produced, what drove confidence, which conditions must be met, and what the runner-up options were.

### 4. Curated marketplace

Provides policy-aware discovery of approved agents that can fulfill the recommended path. The marketplace should support task-specific ranking instead of a single global agent leaderboard.

### 5. Governance flow

Applies policy checks and approval requirements before work begins or before outputs are accepted, depending on risk.

### 6. Execution tracker

Captures launch status, approvals, outputs, and outcome reviews. In v1 this is intentionally lightweight and should support launch-and-track rather than full workflow management.

## Architecture

The first-release architecture should be small and separable:

### Task Intake Service

Receives and validates structured work requests. It also stores editable inferred attributes so users can correct the system when classification is wrong.

### Capability Graph

Stores normalized capability information for execution options.

For agents, this includes:

- capability tags
- supported task types
- cost model
- confidence signals
- tool permissions
- evaluation history
- trust tier

For humans in v1, this is intentionally lighter and can be represented by role templates or named reviewers rather than a full people marketplace.

### Decision Engine

Scores `human`, `agent`, and `hybrid` paths using explicit factors and policy-aware weighting.

### Policy and Governance Engine

Applies rules after recommendation and before launch. This engine is rule-based in v1 so the organization can understand and audit every governance decision.

### Marketplace Service

Surfaces eligible agents and supporting agent details for review and selection.

### Execution Tracker

Records what was launched, what approvals happened, what was produced, and whether the outcome validated the original recommendation.

## Decision logic

The recommendation system should be explainable, policy-weighted, and deterministic enough to audit.

### Decision factors

Each task is evaluated across a small explicit factor set:

- task clarity
- required judgment
- data sensitivity
- business risk
- speed pressure
- cost pressure
- capability fit

These factors produce three scores:

- `human-fit`
- `agent-fit`
- `hybrid-fit`

### Recommendation behavior

The system should prefer:

- `agent-only` for low-risk, well-scoped, reversible internal knowledge work
- `human-only` for high ambiguity, high sensitivity, high political context, or weak agent confidence
- `hybrid` when automation is valuable but meaningful human judgment remains necessary

Hybrid must not be a vague middle state. The system should recommend one of the following patterns:

- `agent-first hybrid`: agent drafts or analyzes, human reviews and approves
- `human-first hybrid`: human frames the task and constraints, agent executes repeatable parts

### Required output of the decision engine

For every task, the product should show:

1. Recommendation
2. Why
3. Confidence
4. Conditions
5. Alternatives

The system should not act like a black box. Users must be able to understand why a route was chosen and what would change the outcome.

## Governance model

The governance model for v1 is policy-based.

Approval is determined by factors such as:

- task sensitivity
- audience
- estimated impact
- agent trust tier
- required permissions

This is preferred over always requiring approval or using a manual advisory-only system because it balances control with speed.

### Governance checkpoints

Governance should happen at three checkpoints:

1. `Pre-selection`
   Only policy-eligible agents should appear as valid options.
2. `Pre-launch`
   Certain tasks require human approval before execution starts.
3. `Post-output`
   Certain outputs require review before they can be accepted as complete.

### Example policy outcomes

- Internal low-sensitivity research summary with a trusted agent: `agent-only allowed`
- Strategy memo for executives with medium sensitivity: `hybrid required`
- External-facing sensitive deliverable: `human approval required before release`

## Marketplace model

The marketplace in v1 is curated and policy-aware.

Every agent profile should include:

- capability tags
- supported task types
- required inputs
- allowed tools
- sensitive-data suitability
- cost basis
- evaluation history
- known failure modes

This marketplace is not an open ecosystem in the first release. The point is not catalog size. The point is making each agent recommendable, governable, and understandable.

### Marketplace ranking

Agents should not be ranked by a single global score. They should be ranked by fit for the current task under the current policy context.

That ranking should consider:

- task-capability match
- trust tier
- policy eligibility
- historical outcome quality
- cost and speed fit

## User flow

The main v1 flow should be:

1. Submit work request
2. Normalize and classify
3. Score execution paths
4. Present recommendation
5. Approve and launch
6. Track outcome

### Step details

#### 1. Submit work request

The user enters the task, outcome, deadline, audience, sensitivity, and context.

#### 2. Normalize and classify

The system derives structured attributes such as:

- task type
- risk level
- reversibility
- required judgment
- capability needs

The user must be able to correct bad inference before launch.

#### 3. Score execution paths

The system scores `human`, `agent`, and `hybrid`, then filters agent choices through policy.

#### 4. Present recommendation

The UI shows:

- recommended route
- explanation
- confidence
- required conditions
- best matching agents or human role templates

#### 5. Approve and launch

If policy requires approval, the approver reviews task risks, agent permissions, and expected outputs. Otherwise, the task can launch directly.

#### 6. Track outcome

The system records status, output location, approval history, completion result, and lightweight performance signals.

## Data model

The minimum data model for v1 should include:

- `Task`
- `CapabilityProfile`
- `AgentProfile`
- `PolicyRule`
- `RecommendationRecord`
- `ApprovalRecord`
- `ExecutionRecord`
- `OutcomeReview`

### Data-model decision

`RecommendationRecord` and `ExecutionRecord` must be separate. The product needs to evaluate not only what happened, but whether the recommendation itself was good. This separation is important for future trust scoring, analytics, and tuning.

## Failure handling

The system must fail safely and visibly.

If the system cannot classify a task confidently, cannot find an approved agent, or encounters conflicting policy rules, it should default to `human review required` and explain the reason.

### Failure cases to support

1. Bad task classification
   Users can edit inferred task properties before launch.
2. No eligible execution option
   The system explains whether capability, approval, or policy is the blocker.
3. Agent mismatch
   Weak outcomes feed back into future fit and trust for similar tasks.
4. Policy conflict
   The product shows the tradeoff and defaults to the safer path.
5. Execution failure
   The user keeps the recommendation context and can choose a fallback path without restarting.

## Validation strategy

The product should be validated with representative knowledge-work scenarios rather than abstract platform checks alone.

Suggested initial scenarios:

- internal research brief
- executive memo draft
- competitive analysis summary
- policy or compliance document review
- multi-step analysis with agent draft and human approval

### Success metrics

The first release should be evaluated on:

- `recommendation clarity`
- `decision speed`
- `governance trust`
- `selection quality`
- `outcome satisfaction`

### Optimization principle

The first release should optimize for decision quality and trust, not maximum automation rate. Conservative routing is acceptable in v1. Risky over-automation is not.

## Assumptions

The following assumptions were made during design:

- the first release is a single product slice, not the whole future workforce OS
- knowledge work is the best initial task domain
- the human side is lighter than the agent side in v1
- the marketplace is curated, not open
- policy rules are explicit and rule-based
- execution tracking is lightweight
- explainability is a product requirement, not an optional feature

If any of these assumptions change, the architecture and scope should be revisited before implementation planning.

## Open follow-on areas

These are intentionally deferred, not unresolved:

- full human talent marketplace
- open agent publishing and monetization
- deeper workflow orchestration
- richer productivity analytics and optimization loops
- autonomous policy learning
- broader task categories beyond knowledge work

## Recommendation for planning

The implementation plan should treat this as a focused vertical slice:

`intake -> classification -> recommendation -> policy filter -> marketplace selection -> approval -> launch -> outcome capture`

That slice is narrow enough to build and strong enough to demonstrate the product thesis.
