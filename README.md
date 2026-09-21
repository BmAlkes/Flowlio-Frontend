# Flowlio frontend

React 19, TypeScript and Vite application for a multi-organization workspace: clients, proposals, projects, tasks, delivery review, time tracking and billing. The same application serves the staff dashboard, member workspace, client portal and platform administration.

Production: https://flowlioapp.com. Backend: https://api.flowlioapp.com.

## Local development

Use Node.js 22 (the CI version) and the committed npm lockfile.

```sh
npm ci
npm run dev
```

Create an uncommitted `.env` containing `VITE_BACKEND_DOMAIN=http://localhost:3000`. Vite serves port 4000. This variable is the backend origin, without `/api`; the Axios client appends `/api`, while Better Auth uses the origin. Restart Vite after changing environment values. Configure the backend with the matching frontend origin and local database. Do not point a development session at production data to test writes.

`VITE_*` values are public browser configuration; backend secrets do not belong here. `VITE_APP_VERSION` is defined at build time from `CF_PAGES_COMMIT_SHA`, then `APP_VERSION`, or `development` locally.

## Checks and build

```sh
npm run lint
npm test -- --maxWorkers=1 --testTimeout=15000
npm run build
npm run preview
```

`build` runs TypeScript and produces `dist/`. GitHub Actions requires `frontend-quality` before main can advance. Tests use simulated services; they do not prove PayPal settlement or delivery of authentication emails. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Application map

| Area | Entry point | Responsibility |
| --- | --- | --- |
| Authentication | `src/providers/user.provider.tsx`, `src/lib/auth-client.ts` | Email/password, session hydration, 2FA and access revocation |
| Routing and navigation | `src/router.tsx`, `src/utils/role-based-navigation.ts` | Staff, client and platform route families |
| Server state | `src/hooks`, `src/configs/axios.config.ts` | Scoped React Query caches and credentialed API calls |
| Core API contracts | `src/contracts/core-api.ts` | Response validation and endpoint contract checks |
| Design and languages | `src/components/ui`, `src/index.css`, `src/configs/i18n.config.ts` | Shared components, tokens, EN/PT/ES/HE and RTL |
| Core workflows | `src/components/proposals`, `src/components/projects`, `src/pages` | Proposal conversion, delivery approval, profitability and capacity |
| Operational errors | `src/lib/telemetry.ts` | Safe UI error reporting and reference identifiers |

Google Calendar integration does not mean Google sign-in is supported. UI visibility complements authorization; the backend remains authoritative. A project marked public is still organization-scoped and the client portal remains tied to its client.

## Where to review the changes

| Feature | Application location | Notes |
| --- | --- | --- |
| Client overview | `/dashboard/client-management/:id` | Overview and related client records |
| Proposal to project | `/dashboard/proposals` | Approved proposal, review draft, create project |
| Profitability | `/dashboard/project/view/:id/profitability` | Owner/platform financial access; explicit currency/cost assumptions |
| Delivery review | `/dashboard/project/view/:id`, `/clients/projects/view/:id` | Request a milestone review; client approves or requests changes |
| Capacity | `/dashboard/team-capacity` | Owner/manager; weekly reference availability and estimated work |
| Workflow notifications | `/dashboard/settings/workflows` | Owner/manager; paused rules, simulation and execution history |
| First steps | Dashboard/member checklist | Server-verified progress; reopen through Settings |
| Operational history | `/dashboard/settings/operations`, `/superadmin/operations` | Organization history or platform view according to role |

Feature behavior and limits: [work plan](docs/plano-de-trabalho.md), [T18](docs/t18-proposal-to-project.md), [T19](docs/t19-profitability.md), [T20](docs/t20-delivery-approval.md), [T21](docs/t21-team-capacity.md), [T22](docs/t22-workflow-automations.md), [T23](docs/t23-core-onboarding.md).

## Release and support

See [release and recovery](docs/release-and-recovery.md). Publish compatible backend changes first, then this frontend. A successful Cloudflare preview is not proof that the main-domain deployment is live; confirm its commit and actual production bundle.

T11 subscription reconciliation remains separate from these published features. Its older branch must be reconciled with the current migration history before release. See the work plan for its current validation status.
