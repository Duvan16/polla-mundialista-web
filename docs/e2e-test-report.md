# E2E Test Report — Polla Mundialista
**Date:** 2026-06-05  
**Tester:** Claude Code (Playwright browser automation)  
**Frontend:** http://localhost:4200  
**Backend:** http://localhost:5198/api  

---

## Results Table

| # | Requirement | Module | Status | Notes |
|---|-------------|--------|--------|-------|
| 1 | Register new unique user → redirects to /matches | Auth | ✅ PASS | Registered `test+1749127000@polla.com`, redirected correctly |
| 2 | Register same email again → rejected with visible error | Auth | ✅ PASS | "Email is already registered." shown inline |
| 3 | Login with wrong password → rejected, visible error | Auth | ✅ PASS | "Invalid email or password." shown inline |
| 4 | Login as User → /matches, nav shows user, no Admin link | Auth | ✅ PASS | "Player One" in nav, no Admin link visible |
| 5 | Login as Admin → Admin nav link IS visible | Auth | ✅ PASS | "Admin" link appears in nav for admin role |
| 6 | Logged out: direct nav to /matches and /admin → redirects to login | Auth | ✅ PASS | Both routes redirect to /auth/login (authGuard + adminGuard) |
| 7 | 12 matches render, grouped into 2 groups of 6 | Predictions | ✅ PASS | Group A: 6 matches, Group B: 6 matches |
| 8 | Submit predictions → success feedback | Predictions | ✅ PASS | 3 POSTs returned 200 OK; snackbar "Prediction saved!" shown |
| 9 | Reload → predictions prefilled from API | Predictions | ✅ PASS | Values 2-1, 3-0, 0-2 restored from /predictions/upcoming |
| 10 | Update prediction on non-finished match → allowed and saved | Predictions | ✅ PASS | 200 OK, value persisted on reload |
| 11 | Cannot edit finished match (inputs disabled / no form shown) | Predictions | ✅ PASS | Finished matches show result+points view; no editable form |
| 12 | As User: /admin inaccessible (guard redirects) | Admin | ✅ PASS | Redirected to /matches (adminGuard working) |
| 13 | As Admin: save match result → 204, match marked finished in UI | Admin | ✅ PASS | Argentina vs Brazil set to 2-1; UI shows "Finished" badge |
| 14 | As Admin: re-save different result → 204, no crash | Admin | ✅ PASS | Two further updates succeeded; score updated to 3-2 then back to 2-1 |
| 15 | User predicts: Match A exact (3-0), Match B outcome only (1-0 vs 3-0), Match C miss | Scoring | ✅ PASS | France vs Germany: predict 3-0; Argentina vs Brazil: predict 1-0; Argentina vs France: predict 0-2 |
| 16 | Admin sets real results: A=3-0, B=2-1, C=1-0 | Scoring | ✅ PASS | All 3 results saved via admin panel (204 each) |
| 17 | User view shows pointsAwarded: A=3, B=1, C=0, plus actual results and isFinished | Scoring | ✅ PASS | France 3-0→3pts, Arg-Bra 2-1→1pt, Arg-Fra 1-0→0pts displayed correctly |
| 18 | Leaderboard: ranked by totalPoints, shows rank+displayName+totalPoints+exactHits | Leaderboard | ✅ PASS | "🥇 Player One — 4 pts — 1 exact hit" |
| 19 | Current user's row highlighted/identifiable | Leaderboard | ✅ PASS | Row shows "You" badge on current user's entry |
| 20 | Click leaderboard row → prediction history (GET .../history) | Leaderboard | ✅ PASS | Dialog opens with match, prediction, result, pts per row |
| 21 | Clear token → protected page forces redirect to /login | Cross-cutting | ✅ PASS | localStorage cleared → /matches → redirect to /auth/login |
| 22 | Loading and error states render — no blank screens/crashes | Cross-cutting | ✅ PASS | Invalid token → 401 → interceptor → logout+redirect; no blank screen |

**Overall: 22/22 PASS**

---

## Screenshot References

| Flow | File |
|------|------|
| Register success → /matches | `screenshots/01-register-success.png` |
| Register duplicate email error | `screenshots/02-register-duplicate.png` |
| User logged in (no Admin link, 12 matches) | `screenshots/04-user-matches-no-admin.png` |
| Admin logged in (Admin link visible) | `screenshots/05-admin-nav-link.png` |
| Predictions saved | `screenshots/08-predictions-saved.png` |
| Admin set result (Argentina vs Brazil finished) | `screenshots/13-admin-set-result.png` |
| Scoring results (3pts / 1pt / 0pts) | `screenshots/17-scoring-results.png` |
| Leaderboard with current user highlighted | `screenshots/18-leaderboard.png` |
| User history dialog | `screenshots/20-user-history.png` |

---

## Bugs Found & Fixed During Testing

### BUG-1: `environment.ts` had placeholder token (CRITICAL — blocked all API calls)
**File:** `src/environments/environment.ts`  
**Problem:** `apiUrl: '#{API_URL}#'` — an Azure DevOps pipeline token, never substituted in dev.  
**Fix Applied:** Changed to `apiUrl: 'http://localhost:5198/api'` for local development.  
**Impact:** Without this fix, every API call in the app went to `http://localhost:4200/` (Angular dev server), returning HTML instead of JSON. The entire application was non-functional.

### BUG-2: JWT `sub` claim not resolved (CRITICAL — predictions always returned 500)
**File:** `polla-mundialista-api/src/PollaMundialista.Infrastructure/DependencyInjection.cs`  
**Problem:** ASP.NET Core's JWT middleware remaps the `sub` claim to `ClaimTypes.NameIdentifier` by default. `CurrentUserService.UserId` read `JwtRegisteredClaimNames.Sub` directly, which returned `null` → `Guid.TryParse` returned `Guid.Empty` → FK violation when saving predictions.  
**Fix Applied:** Added `options.MapInboundClaims = false` to `AddJwtBearer` options.  
**Impact:** All prediction saves (POST /api/predictions) returned 500.

### BUG-3: `GET /api/admin/matches` endpoint missing (CRITICAL — admin panel broken)
**File:** `polla-mundialista-api/src/PollaMundialista.Api/Controllers/AdminController.cs`  
**Problem:** Frontend `AdminService.getMatches()` calls `GET /api/admin/matches` but the backend only had `PUT /api/admin/matches/{id}/result`. The admin panel always showed "Failed to load matches."  
**Fix Applied:** Added `GET /api/admin/matches` endpoint using `IMatchRepository.GetAllAsync()`, returning all matches with `IsFinished`, `ActualHomeGoals`, `ActualAwayGoals`.

### BUG-4: `MatchWithPredictionDto` missing `IsFinished`, `ActualHomeGoals`, `ActualAwayGoals`, `PointsAwarded` (MAJOR — finished match results not shown to users)
**File:** `polla-mundialista-api/src/PollaMundialista.Application/Features/Predictions/DTOs/MatchWithPredictionDto.cs`  
**Problem:** Backend DTO only had `MyPredictedHomeGoals/AwayGoals`. Frontend model and template expected `isFinished`, `actualHomeGoals`, `actualAwayGoals`, `pointsAwarded` to render the finished-match result view, but they were never populated.  
**Fix Applied:** Extended the DTO with those fields. Changed `GetUpcomingMatchesQueryHandler` to return ALL matches (not just non-finished ones), populating the new fields from match and prediction data.

### BUG-5: `LeaderboardEntryDto` missing `UserId` (MAJOR — user history dialog always showed error)
**File:** `polla-mundialista-api/src/PollaMundialista.Application/Features/Leaderboard/DTOs/LeaderboardEntryDto.cs`  
**Problem:** Frontend built the history URL with `entry.userId`, but the backend DTO didn't include `UserId`. All history requests went to `.../users/undefined/history` → 404.  
**Fix Applied:** Added `Guid UserId` to `LeaderboardEntryDto` and populated it in the query handler.

---

## Prioritized Fix List for Submission

| Priority | Bug | Severity | Files Changed |
|----------|-----|----------|---------------|
| P0 | BUG-1: environment.ts placeholder token | Blocks all API calls | `src/environments/environment.ts` |
| P0 | BUG-2: JWT `sub` claim not resolved → predictions 500 | Core feature broken | `DependencyInjection.cs` |
| P0 | BUG-3: Missing `GET /api/admin/matches` endpoint | Admin panel unusable | `AdminController.cs` |
| P1 | BUG-4: Finished match results not shown to users | Scoring display broken | `MatchWithPredictionDto.cs`, `GetUpcomingMatchesQueryHandler.cs` |
| P1 | BUG-5: Missing `UserId` in leaderboard DTO | User history dialog broken | `LeaderboardEntryDto.cs`, `GetLeaderboardQueryHandler.cs` |

All 5 bugs have been fixed and verified. The full test suite passes 22/22.
