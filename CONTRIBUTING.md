# Contributing to Aria S2C

Thanks for considering contributing! This document explains how to get the project running locally and the recommended workflow for contributions.

## Getting started

1. Clone the repo and install dependencies:

```powershell
git clone <repo-url>
cd aria-s2c-20
npm install
```

2. Copy the example env and run in contribution mode (no Stripe required):

```powershell
Copy-Item .env.local.example .env.local
notepad .env.local
# Leave STRIPE_SECRET_KEY and STRIPE_PRICE_ID empty for contribution/demo mode
```

3. Apply database migrations (if you changed the Prisma schema):

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

4. Start the dev server:

```powershell
npm run dev
```

## Development notes

- Authentication: Clerk is used for authentication. The repo is tolerant if `CLERK_SECRET_KEY` is not set so contributors can run without setting up Clerk.
- Stripe: The checkout flow will fall back to a dev-mode session when Stripe keys are missing and will upsert an `active` subscription in SQLite. This allows contributors to test the subscribe/renew flow without Stripe.
- Prisma: SQLite is used in dev. If you change `prisma/schema.prisma`, run `npx prisma migrate dev` to create/update `prisma/dev.db`.

## How to contribute

1. Create a branch with a descriptive name:

```bash
git checkout -b feat/your-feature
```

2. Make small, focused changes and include tests where relevant.
3. Commit and push your branch, then open a Pull Request against `main`.

## PR checklist

- [ ] Code builds and `npm run dev` works locally
- [ ] No TypeScript errors
- [ ] Tests (if any) pass
- [ ] Update `README.md` or docs if behavior changed

## Contact

If you need help, open an issue or ping the maintainers in the repo. Include logs and the exact reproduction steps.
