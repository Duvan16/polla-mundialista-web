# CLAUDE.md — Polla Mundialista Web

## Project

Frontend for "Polla Mundialista" — a private World Cup prediction pool. Angular 17+.
technical assessment. Companion backend repo: polla-mundialista-api (.NET 8).

## Stack

- Angular 17+ (standalone components, no NgModules)
- Signals for state; new control flow (@if / @for / @switch)
- Functional route guards + functional HTTP interceptors
- Reactive Forms
- Angular Material (minimal, professional)
- TypeScript strict mode

## Architecture

- **core/**: auth (AuthService, JWT interceptor, authGuard, adminGuard), models, base API service, app-init.
- **features/**: auth, matches, admin, leaderboard. Lazy-loaded routes.
- **shared/**: reusable UI components, layout, pipes.
- **environments/**: environment.ts with `apiUrl`.

## Hard rules (do not violate)

- Standalone components only. NO NgModules.
- Use signals for component/service state. Use `computed()` for derived state (e.g. isAdmin).
- Use the new control flow (@if/@for/@switch) — NOT *ngIf / *ngFor.
- Smart vs presentational separation: services do HTTP and return typed Observables; components consume them.
- A single JWT interceptor attaches the bearer token and handles 401 → logout + redirect to /login.
- Guards are FUNCTIONAL (CanActivateFn), not class-based.
- All API responses are strongly typed against models in core/models. No `any`.
- Handle loading, empty, and error states for every data-driven view.
- Surface backend errors from ProblemDetails to the user (toast / inline).

## Domain rules (must match backend)

- Roles: User (predicts), Admin (loads results). Admin routes guarded by adminGuard.
- Matches: 12 total, 2 groups (A & B). Group them visually.
- Predictions: home/away goal inputs; editable only while match not finished; show points + actual result once finished.
- Leaderboard: ranking by points (tiebreaker: exact hits). Highlight current user's row.
- Clicking a leaderboard row shows that user's prediction history.

## API contract

Base URL from environment.apiUrl. Keep endpoint paths in one place (a typed API service per feature or a constants file). Match the backend Swagger exactly.

## Conventions

- Feature folders; one component per folder with its template/styles.
- Auth state persisted in localStorage, rehydrated on app init.
- Conventional commits (feat:, fix:, style:, chore:, refactor:).
- Keep styling minimal and consistent — Material components, no heavy custom CSS.

## Commands

- Install: `npm install`
- Dev: `ng serve` (proxy to API if needed)
- Build: `ng build`
- Lint: `ng lint`
- Test: `ng test`

## Workflow expectations

- Confirm the API contract / models before building data-bound components.
- Show routing + folder structure before generating feature code.
- After a feature, verify it builds (`ng build`) and report.
- Production environment.ts points at the hosted API URL (Azure).
