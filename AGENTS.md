# AGENTS.md

This file is instructions for agentic coding tools operating in this repo.
Keep changes small, follow existing patterns, and prefer Docker Compose workflows.

## Repo Overview
- Stack: Node.js + TypeScript (strict) + Express + Prisma + Postgres.
- Runtime: the intended dev/prod environment is Docker Compose (`api` + `db`).
- Persistence:
  - Postgres is the source of truth.
  - File artifacts are stored under `storage/` (mounted volume in Docker Compose).
- Multi-tenancy:
  - Most data is scoped by `organizationId`.
  - API auth attaches `req.user = { userId, organizationId, role }`.

## Agent Rules
- Do not touch generated/build artifacts: `dist/`, Prisma generated client, or `node_modules/`.
- Prefer running commands in the container (`docker compose exec api ...`) unless explicitly requested otherwise.
- Do not add new deps (npm packages) unless necessary; if you do, update `package-lock.json`.
- This repo currently has no ESLint/Prettier/test-runner configured; do not invent commands.

## Cursor/Copilot Rules
- No Cursor rules found (`.cursorrules` or `.cursor/rules/`).
- No Copilot instructions found (`.github/copilot-instructions.md`).

## Build / Lint / Test Commands

### One-time setup
- Create local env file:
  - `cp .env.example .env`
- Start services:
  - `docker compose up --build -d`
- Follow logs:
  - `docker compose logs -f api`

### Core commands (preferred: inside container)
- Start dev server (container already does this via `scripts/dev-start.sh`):
  - `docker compose up --build`
- Run app health endpoint:
  - `curl http://localhost:3000/health`

### NPM scripts (from `package.json`)
Run these inside the container unless you know you’re on a compatible host:
- Dev:
  - `docker compose exec api npm run dev`
- Build (compile TS to `dist/`):
  - `docker compose exec api npm run build`
- Typecheck only:
  - `docker compose exec api npm run typecheck`
- Healthcheck script (does env + prisma + /health + typecheck):
  - `docker compose exec api npm run check-health`
- Prisma client generation:
  - `docker compose exec api npm run prisma:generate`
- Prisma migrate (dev):
  - `docker compose exec api npm run prisma:migrate`

### Docker helper scripts (from `package.json`)
- `npm run docker:up` -> `docker compose up --build -d`
- `npm run docker:down` -> `docker compose down`
- `npm run docker:reset` -> `docker compose down --remove-orphans && docker compose up --build -d`

### Lint
- No linter is configured (no `lint` script, no repo-level ESLint config).
- Use `npm run typecheck` as the baseline static check.

### Tests
- No automated test runner is configured (no `test` script; no jest/vitest config).

#### “Run a single test”
- Not applicable right now.
- Closest equivalents:
  - Run a single static check: `docker compose exec api npm run typecheck`
  - Run a single end-to-end sanity check: `docker compose exec api npm run check-health`

## Development Workflow Notes

### Where the server starts
- Entry point: `src/server.ts`.
  - `dotenv.config()` runs before importing `app`.
  - Do not move env loading below other imports.
- Express app assembly: `src/app.ts`.
  - Middleware order: `express.json()` -> routers -> `errorMiddleware` last.

### Prisma usage
- Use `getPrismaClient()` from `src/lib/prisma.ts` (singleton).
- Avoid constructing `new PrismaClient()` in request-handling code.
  - Exception: standalone scripts like `src/scripts/healthcheck.ts` may use their own client.
- Always enforce tenant boundaries:
  - Prefer `findFirst({ where: { id, organizationId } })` over `findUnique({ where: { id } })`.
- Store file paths as relative paths:
  - Use `path.relative(process.cwd(), absolutePath)` when persisting to DB.

### Storage layout
- Keep all persisted files inside `storage/` (mounted by Docker Compose).
- Stable layout used in services:
  - `storage/{organizationId}/{requestId}/original.pdf`
  - `storage/{organizationId}/{requestId}/evidence/...`
- Avoid keeping large Base64 in the DB.

## Code Style Guidelines (follow existing code)

### TypeScript / types
- `tsconfig.json` has `strict: true`. Keep strictness; do not suppress typing.
- Prefer `unknown` for untrusted inputs (HTTP body/query/env), then narrow.
- Do not introduce `any`, `@ts-ignore`, or `@ts-expect-error`.
- For env parsing, throw `ApiError` with a clear code (see `ReportingService.parseCost`).

### Formatting
- Indentation: 2 spaces.
- Strings: single quotes.
- Semicolons: required.
- Keep files small and cohesive; avoid unrelated refactors.

### Imports
- Group imports in this order:
  1. Node built-ins
  2. Third-party deps
  3. Internal modules
- Separate groups with a blank line.
- Use `import type { ... }` when importing only types.

### Naming
- Files: `kebab-case.ts` (e.g., `auth.controller.ts`, `error.middleware.ts`).
- Classes: `PascalCase` (`AuthController`, `RequestService`).
- Functions/vars: `camelCase`.
- API error codes: `SCREAMING_SNAKE_CASE` strings.

### Architecture conventions
- Routers: exported builder functions returning `Router`:
  - `export function buildXRouter(): Router { ... }`
- Controllers: classes with `public static async` handlers.
  - Wrap handler body in `try/catch` and call `next(err)`.
- Services: classes with `public static async` methods.
  - Business logic + Prisma + integration calls live here.

### Error handling
- Use `ApiError` (`src/errors/ApiError.ts`) for expected failures.
  - Include: `statusCode`, `code`, `message`, optional `detail`.
- Let `errorMiddleware` format the response; don’t duplicate formatting in controllers.
- For unexpected errors, let middleware return `{ ok: false, code: 'INTERNAL_ERROR', ... }`.

### HTTP/API patterns
- Success responses consistently include `{ ok: true, ... }`.
- Validate request params/body explicitly.
  - Prefer small helper functions like `requireString(...)`.

### Security / multi-tenant safety
- Never trust `organizationId` from body/query; always use `req.user.organizationId`.
- Ensure every read/write to tenant-owned tables filters by `organizationId`.
- Do not log secrets (JWT, API keys) or include them in error `detail`.

## Notes on Windows Hosts
- Some dev machines may require elevated privileges for Docker Engine access.
  - If `docker compose up --build` fails with a Windows pipe permission error, verify Docker Desktop is running and the shell has required privileges.
