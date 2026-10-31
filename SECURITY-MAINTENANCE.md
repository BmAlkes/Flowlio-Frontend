# Runtime and dependency maintenance

The supported build runtime is pinned in `.node-version` and `package.json`.
Cloudflare Pages must use that version; inspect any `NODE_VERSION` override in
both production and preview settings. `npm run build` rejects a different runtime.
Deploy the generated `dist` directory as a static site, not `vite preview`.

Use a new branch, `npm ci`, lint, tests and build before publishing. The CI audit
blocks high and critical advisories and prints lower-severity findings for review.

## Tracked advisory, 2026-10-31

GHSA-g3hv-75wg-m249 affects minimatch below 11.0.1. ESLint and its integrations
still require older minimatch APIs. The current exposure is lint/build tooling
processing repository-controlled glob patterns, not a user-facing glob endpoint.
Do not force minimatch 11 into callers expecting the callable v3 API. Re-evaluate
upstream ESLint/integration releases and remove this exception when compatible
fixes are available. Do not pass untrusted patterns to these tools.

Before rollback, rebuild the previous application commit with the patched runtime;
do not restore an artifact containing the vulnerable Node binary.
