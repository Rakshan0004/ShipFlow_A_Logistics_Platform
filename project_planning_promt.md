# Instructions for AI Agent — Zippy Logistics Platform (Planning Phase)

You are acting as a senior software architect. Attached in this project folder is
`Zippy_ai_document.pdf` — the full assignment spec for a logistics aggregation
platform. Read it completely before doing anything else.

**Context:** this is a take-home coding assignment for a job application. It will
never be deployed to production. The goal is to demonstrate strong architecture,
clean code, and engineering judgment — not to run a live service. Do not spend
effort on production concerns (CI/CD, cloud infra, autoscaling, secrets managers).
Do spend effort on: clean layering, correct domain modeling, sensible design
patterns, test coverage, and documentation that reads like a real engineer wrote it.

## Tech stack (fixed — do not deviate)
- Backend: Java, Spring Boot ( Gradle )
- Frontend: React.js
- Database: your choice (H2 or PostgreSQL via Docker Compose) — state the tradeoff
- Mock couriers: your choice of structure (separate Spring Boot apps vs. isolated
  packages/controllers in one app) — this decision must be justified in writing,
  since the assignment explicitly asks for design decisions to be explained

## Phase discipline — READ THIS CAREFULLY
This is a **planning-only** phase. Do not write application code yet.
Your job right now is to produce a complete set of planning documents. Once they're
done, stop and wait for explicit approval before starting implementation (Sprint 0).

## Step 1 — Confirm understanding
Produce `/docs/REQUIREMENTS.md` that restates, in your own structured words:
- the full functional flow (order → rates → selection → shipment → webhooks → tracking)
- the three courier request/response formats (as-is, since they're fixed contracts)
- the normalized Zippy formats (rate response, status enum, data model)
- the explicit failure scenarios and testing expectations listed in the spec
This is a comprehension check — if anything in the source doc is ambiguous or
underspecified, flag it in a `## Open Questions` section at the bottom rather than
guessing silently.

## Step 2 — Produce the planning document set
Create these files under `/docs`:

1. **CLAUDE.md** (project root — this is the file you'll re-read every session)
   - coding conventions (package structure, naming, DTO vs entity separation)
   - the courier-adapter pattern to use (Strategy/Adapter interface so all 3
     couriers implement a common `CourierClient` contract)
   - definition of done for any task (code + test + doc updated)
   - how to run the app locally, how to run tests
   - pointers to the other docs below, so you don't have to re-derive them each session

2. **ARCHITECTURE.md**
   - high-level component diagram (mermaid) — frontend, Zippy backend, 3 mock
     couriers, database, webhook ingress
   - layering inside the backend (controller → service → adapter → repository)
   - the courier-adapter/strategy pattern in detail
   - your decision on mock-courier structure (separate apps vs. packages) with
     rationale
   - your decision on whether carrier-selection and shipment-creation are one API
     or two, with rationale (the spec explicitly allows either, but requires
     justification)
   - concurrency/timeout strategy for calling 3 couriers in parallel (e.g.
     `WebClient` + `CompletableFuture`/reactive with a per-call timeout, so one
     slow/dead courier doesn't block the others)

3. **DATA_MODEL.md**
   - ERD (mermaid) covering Order, ShippingQuote, Shipment, ShipmentEvent from the
     spec's minimum data model
   - migration strategy (Flyway/Liquibase — pick one)
   - indexing notes (e.g. unique constraint for webhook idempotency keys)

4. **API_CONTRACTS.md**
   - every Zippy-facing endpoint from the spec's "Suggested Zippy APIs" list, with
     request/response shape and status codes
   - every mock-courier endpoint (rate + shipment-creation + webhook) exactly as
     given in the spec, since those formats are fixed inputs you must match

5. **COURIER_NORMALIZATION.md**
   - the field-mapping tables: each courier's rate response → Zippy rate response;
     each courier's webhook payload/status code → Zippy normalized status
   - the status state-machine (which transitions are valid, e.g. DELIVERED must
     not move back to IN_TRANSIT) and how an invalid transition is handled
     (reject vs. log-and-ignore — pick one, justify it)

6. **EDGE_CASES_AND_FAILURE_HANDLING.md**
   - one line per failure scenario in the spec (courier down, timeout, duplicate
     webhook, unknown tracking number, invalid transition, price-change-after-quote)
     mapping it to the specific mechanism that handles it (e.g. duplicate webhook →
     idempotency key = carrier_event_id + shipment_id, unique DB constraint)

7. **TESTING_STRATEGY.md**
   - map each item in the spec's "Testing Expectations" list to a test class/type
     (unit vs. integration), and which layer it lives in
   - test data / fixtures approach

8. **SPRINT_PLAN.md**
   - break the build into sprints with clear acceptance criteria per sprint, e.g.:
     - Sprint 0: repo scaffolding, Docker Compose skeleton, CI-free local run script
     - Sprint 1: Order domain — create/get order, validation, persistence
     - Sprint 2: Mock courier services — all 3, matching exact contracts from the spec
     - Sprint 3: Rate aggregation — parallel calls, normalization, timeout/partial-failure handling
     - Sprint 4: Carrier selection + shipment creation against the real mock APIs
     - Sprint 5: Webhooks — ingestion, normalization, idempotency, status history
     - Sprint 6: React frontend — the 3 screens, polling for status updates
     - Sprint 7: Test suite completion (all items from TESTING_STRATEGY.md)
     - Sprint 8: README, Postman collection, sample data, architecture write-up polish
   - each sprint lists: goal, tasks, files touched, "done when" criteria, and which
     doc(s) to update if the implementation deviates from the plan

9. **/docs/skills/** — short reusable playbooks you will re-read before repeating a
   pattern, so all 3 courier integrations and both frontend/backend layers stay
   consistent:
   - `skills/courier-adapter.md` — checklist for adding a new courier client
     (interface to implement, error/timeout handling, mapping function, test to add)
   - `skills/webhook-handler.md` — checklist for a new webhook endpoint (signature
     validation if any, idempotency check, status mapping, event persistence)
   - `skills/spring-boot-module.md` — package layout, DTO/entity/mapper conventions,
     exception handling conventions for this project
   - `skills/react-screen.md` — component structure, API client conventions, state
     handling conventions for this project's frontend

## Step 3 — Stop and wait
After all files above exist, summarize what was produced and the key design
decisions made (mock-courier structure, one API vs. two for selection+shipment,
invalid-transition handling), then **stop and wait for approval** before starting
Sprint 0. If anything in Step 1's "Open Questions" is blocking, ask about that
specifically rather than guessing.

## Quality bar
Write these docs the way you'd want them if you were handed this project cold in
six months. Prefer explicit decisions with one-line rationale over vague options.
Diagrams in mermaid where they add clarity, not for decoration.