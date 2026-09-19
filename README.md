# CareWeave Backend (P2)

This is the cleaned P2 backend scaffold exported from Claude and reorganized into the intended backend structure.

## Current status
- Fastify application bootstrap and `/health` endpoint are implemented.
- PostgreSQL + Prisma schema and fictional demo seed are included.
- Auth/authz is currently fail-closed scaffolding; token verification is not implemented yet.
- Patient/condition/timeline/medication/appointment/care-team routes are contract stubs returning HTTP 501 until their services are implemented.
- No clinical reasoning, care-state calculation, next-action logic, or AI logic belongs in this P2 backend.

## Run locally
1. Copy `.env.example` to `.env` and set real local development values.
2. Start PostgreSQL (Docker Compose is provided).
3. Install dependencies.
4. Run Prisma generate/migration and seed.
5. Run the test suite.

The scaffold was not executed in the original Claude sandbox because its environment lacked PostgreSQL/network access.
