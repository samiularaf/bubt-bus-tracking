# Setup Notes — Dependency Decisions (Phase 6)

## Known accepted risk: Vite dev-server vulnerability

`npm audit` flags a moderate/high severity issue in `esbuild` (bundled inside `vite`'s dev server) — a malicious website could send requests to the local Vite dev server and read responses, if you happen to have it running while browsing that site.

**Why this is accepted rather than fixed immediately:** the only available fix is jumping to `vite@8`, a very recent major version with an accompanying ecosystem of breaking changes (plugin API, config format) that would need real verification against this specific project before adopting — not something to force blindly this early. The vulnerability is also dev-only: it does not affect the production build output shipped to Cloudflare Pages, only your local `npm run dev` session.

**Mitigation in the meantime:** don't browse untrusted sites while running the dev server; the dev server only binds to localhost by default. Revisit this before Phase 12 (Deployment) — by then, `vite@8` and its plugin ecosystem will likely be better-proven, and this can be safely upgraded with a proper test pass.

## Deliberately NOT upgraded to their newest majors (as of this setup)

`react`/`react-dom` (19.x), `express` (5.x), `tailwindcss` (4.x), `typescript` (7.x), and `prisma`/`@prisma/client` (7.x) all have significantly newer major versions available than what's pinned in this project's `package.json` files. None of these were flagged by `npm audit` — this project intentionally stays on the versions below because they're well-understood, stable, and proven to work together:

- `react` / `react-dom` `^18.3.1`
- `express` `^4.19.2`
- `tailwindcss` `^3.4.10`
- `typescript` `^5.5.4`
- `prisma` / `@prisma/client` `^5.18.0`

**Revisit this decision periodically** (e.g. before Phase 12, or if a specific new feature needs something only the newer major provides) rather than upgrading reflexively just because a newer version exists.

## Patched without hesitation

`bcrypt` and `node-cron` were bumped to their latest majors (`^6.0.0` and `^4.6.0` respectively) specifically to resolve real `npm audit` findings (a `tar` path-traversal chain and a `uuid` buffer bounds issue). Both packages have small, stable APIs where a major version bump carries low compatibility risk.

## Phase 8: verifying backend code without a real database

This sandbox cannot reach `binaries.prisma.sh`, so `prisma generate` / `prisma migrate` cannot run here — there is no way to obtain a real, working `@prisma/client` in this environment. To still verify the Phase 8 backend code was genuinely correct (not just "looks right"), two *temporary* stub files were used and then deleted before each commit:

1. **`node_modules/@prisma/client/index.d.ts`** — type declarations only, mirroring the real shape Prisma would generate (models as typed CRUD methods, enums as `const` object + derived union type, matching Prisma's actual codegen pattern rather than a nominal TS `enum`). Used for `tsc --noEmit`.
2. **`node_modules/@prisma/client/index.js`** — a runtime-executable version of the same stub (in-memory no-op models returning empty results) — used to actually **boot the Express server** and hit real endpoints with `curl`, proving the full middleware chain (CORS → JSON parsing → routing → Zod validation → JWT auth → RBAC → error handling) works correctly end-to-end. This caught real bugs (see commit history) that typechecking alone would have missed — e.g. `jsonwebtoken` v9's stricter `expiresIn` typing, and an incorrect enum pattern in the first stub draft.

**What this proves:** request routing, validation rejection messages, JWT sign/verify, RBAC (a `user`-role token is correctly `403`'d off an admin route; an `admin`-role token correctly passes through to the next layer), and error envelope shape are all genuinely correct.

**What this does NOT prove:** that any individual Prisma query (field names, relation includes, compound unique key names like `userId_busId`) is 100% correct against the real generated client — that requires running `prisma generate` with real network access, which the next developer should do as the very first step in Phase 9+ or before deploying Phase 8. Cross-referenced `schema.prisma` carefully while writing each service, but this is the one category of bug this sandbox cannot fully catch.
