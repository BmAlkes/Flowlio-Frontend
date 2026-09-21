# Release and recovery

## Normal release

1. Start a task branch from the current main, preserving unrelated local work.
2. Run lint, relevant tests and build. Push the branch and wait for the required check on that exact commit: `frontend-quality` or `backend-quality`. Main protection requires the checks; do not bypass it.
3. Integrate the backend first. Railway must report success. Check `/api/health` and, for an authenticated test account, the affected flow. Never use a real payment as an infrastructure smoke test.
4. Integrate the frontend. Cloudflare Pages must publish the main branch. Check `https://flowlioapp.com/`, the deployed commit and the actual `index-*.js` asset, then the affected route.
5. Report the feature, validation, commit/deploy status and the application path where users can inspect it. A push alone is not a verified deployment.

The current SPA deployment can return HTTP 404 with the application HTML for deep routes because of its `404.html` fallback. Inspect whether the browser renders the route; distinguish this hosting behavior from the application's error boundary. Do not treat the HTTP code alone as a completed UI test.

## GitHub Actions failure notifications

Emails titled `Quality workflow run` are sent by GitHub for repository checks. They are not application emails. Open the run, inspect the failed job and its first actual test/build failure. Expected database errors inside rollback tests can also appear in logs; use the test result rather than interpreting every error line as an incident.

A failed branch check blocks integration and does not itself mean production is down. Fix the cause, rerun the failed coverage and required CI, then publish. Keep checks and main protection enabled.

## A page shows an error reference

Record route, approximate UTC time, account role, organization context, reference ID and deployed version. Do not attach passwords, session cookies or payment credentials. Organization owners/managers can inspect **Settings → Operational history**; platform superadmins have `/superadmin/operations`.

For a recently published change, check frontend/backend version compatibility. The T19 project-page regression was a shared `Button asChild` composition error, corrected with `Slottable` and a real project-page render test. Preserve that test when changing shared buttons.

## Backend fails before listening

Check Railway startup logs, not only the build result. The compiled HTTP entry must initialize `module-alias/register` before importing route dependencies that use `@/`. The CI compiled-startup test launches the built server without development loaders, applies migrations to an empty isolated database, checks health and verifies the protected capacity endpoint rejects an anonymous request.

The shared `throttle` table is managed by release migration `0010_request_throttle`; middleware must not race to create it at import time. Existing throttle records are preserved. New migrations must retain the versioned SQL, journal and snapshots together.

## Rollback and data recovery

Prefer a forward fix when a schema migration has already been applied. A code rollback is safe only if it remains compatible with the current schema, queue and session contracts. Never rewrite a published migration or delete its ledger to force startup. Back up before a database change; validate a restore in an isolated environment before considering a production restore.

For an uncertain external job, reconcile provider records before retrying: interrupted payment/email operations may have happened even if the application lacks confirmation. Do not bulk-replay jobs or manually mark invoices paid as a recovery shortcut.

Backend details live in its `docs/release-migrations.md`, `docs/durable-jobs.md` and `docs/core-operations.md`. No production restore or real PayPal Sandbox lifecycle was performed as part of the documentation task.
