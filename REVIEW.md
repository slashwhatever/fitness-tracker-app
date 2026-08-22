# LogSet — Code Review Report

_Generated 2026-08-22 · fitness-tracking-app monorepo_

## Method

A multi-agent review: **9 finders** across 4 dimensions (correctness, security, optimization, refactoring) over the shared data layer, web app, mobile app, and the **live** Supabase project. Every critical/high finding was then re-checked by an **independent adversarial verifier** that re-read the actual code and tried to refute it. 23 agents total.

**Outcome:** 55 raw findings → after verification **7 high, 29 medium, 18 low** (1 refuted, 6 downgraded from high, plus 1 false-positive caught on manual reconciliation — see below).

### Reconciliation notes

- **Dropped (false positive):** "useDuplicateWorkout produces an empty workout." The finder inspected the **dead** pre-DI copy in `packages/shared/src/hooks/workouts/`. The *wired* implementation (`packages/shared/src/hooks/useWorkouts.ts:536-582`) copies `workout_movements` correctly. This reinforces the recommendation to delete that dead folder.

- **Verified:** the plaintext `postgres` superuser URL in `apps/mobile/.env` is **not** tracked in git and **not** in history (`.gitignore` covers `.env*`). Exposure is working-tree plaintext only — still rotate as a precaution and remove it from the client package.

### Verified healthy (not issues)

- RLS is enabled and correctly owner-scoped on all 14 tables; reference tables are read-only public. No cross-user read exposure.
- The two web server actions are properly authorized (`getUser()` + `user_id` scoping) — no IDOR.
- No `service_role` key or other secret ships in the client bundle; `EXPO_PUBLIC_*`/publishable keys are meant to be public (RLS-protected).
- The "shared hook + thin platform wrapper" (dependency-injection) architecture is sound and ~90% migrated.
- The four in-repo migrations are correct.

## Findings at a glance

| # | Sev | Dimension | Area | Title | File |
|---|-----|-----------|------|-------|------|
| 1 | 🔴 high | security | web/shared | Password-reset email link points to a nonexistent /auth/callback route | `apps/web/src/components/auth/ResetPasswordForm.tsx` |
| 2 | 🔴 high | correctness | web | Dashboard library prefetch poisons shared movement-templates cache with an empty | `apps/web/src/components/features/DashboardContent.tsx` |
| 3 | 🔴 high | correctness | web | Create/Update user-movement mutations cache raw DB rows, dropping muscle_groups  | `apps/web/src/hooks/useMovements.ts` |
| 4 | 🔴 high | correctness | mobile | Rest timer pause/resume ignores paused time — timer jumps forward or completes o | `apps/mobile/components/RestTimerProvider.tsx` |
| 5 | 🔴 high | correctness | mobile | addTime does not re-sync the headless foreground-service timer, firing 'Rest Com | `apps/mobile/components/RestTimerProvider.tsx` |
| 6 | 🔴 high | correctness | mobile | Password reset flow navigates to a non-existent /reset-password route | `apps/mobile/hooks/useDeepLink.ts` |
| 7 | 🔴 high | optimization | web/shared | Dashboard 'library' prefetch poisons the movement-templates cache with an empty  | `apps/web/src/components/features/DashboardContent.tsx` |
| 8 | 🟡 medium | security | web/shared | Open redirect in login flow via unsanitized redirectTo param | `apps/web/src/components/auth/LoginForm.tsx` |
| 9 | 🟡 medium | security | web/shared | No middleware: auth is client-only and server session refresh is dead code (defe | `apps/web/src/lib/supabase/server.ts` |
| 10 | 🟡 medium | security | db/mobile | Auth tokens stored in unencrypted AsyncStorage (refresh-token theft = account ta | `apps/mobile/lib/supabase/client.ts` |
| 11 | 🟡 medium | security | db/mobile | sets INSERT policy omits user_movement ownership check; SECURITY DEFINER trigger | `supabase/migrations` |
| 12 | 🟡 medium | security | db/mobile | 7 functions run without a pinned search_path (SECURITY DEFINER hardening) | `live` |
| 13 | 🟡 medium | security | db/mobile | Plaintext production Postgres superuser password committed in repo working tree | `apps/mobile/.env` |
| 14 | 🟡 medium | correctness | shared | useBackgroundSync overwrites the full workouts list cache with only 5 rows (wron | `packages/shared/src/hooks/useBackgroundSync.ts` |
| 15 | 🟡 medium | correctness | shared | useCreateSet optimistic insert into the main sets list is never rolled back on e | `packages/shared/src/hooks/useSets.ts` |
| 16 | 🟡 medium | correctness | shared | useMovementLastSets mutates the caller's movementIds array in place via .sort() | `packages/shared/src/hooks/useMovementLastSets.ts` |
| 17 | 🟡 medium | correctness | shared | useDuplicateWorkout produces an empty workout — it never copies workout_movement | `packages/shared/src/hooks/workouts/useDuplicateWorkout.ts` |
| 18 | 🟡 medium | correctness | web | Sign-out from Settings navigates to nonexistent /auth route (404) | `apps/web/src/components/features/SettingsContent.tsx` |
| 19 | 🟡 medium | correctness | mobile | Shared useBackgroundSync uses web-only document/window APIs — throws on React Na | `packages/shared/src/hooks/useBackgroundSync.ts` |
| 20 | 🟡 medium | optimization | web/shared | Dashboard prefetches write to query keys that don't match their consumer hooks ( | `apps/web/src/components/features/DashboardContent.tsx` |
| 21 | 🟡 medium | optimization | web/shared | Background sync prefetches the workouts list under the same key but with a trunc | `packages/shared/src/hooks/useBackgroundSync.ts` |
| 22 | 🟡 medium | optimization | web/shared | refetchOnMount:'always' on core dashboard queries defeats their configured stale | `packages/shared/src/hooks/useWorkouts.ts` |
| 23 | 🟡 medium | optimization | web/shared | Editing one movement invalidates every workout's movement list (over-broad inval | `apps/web/src/hooks/useMovements.ts` |
| 24 | 🟡 medium | optimization | mobile/db | Entire set history rendered in a ScrollView with no virtualization | `apps/mobile/app/workout/[id]/movement/[movementId]/index.tsx` |
| 25 | 🟡 medium | optimization | mobile/db | RestTimer context value rebuilt every tick forces 1Hz re-render of set-logging s | `apps/mobile/components/RestTimerProvider.tsx` |
| 26 | 🟡 medium | optimization | mobile/db | DraggableFlatList inline renderItem plus O(n^2) last-set lookup per row | `apps/mobile/app/workout/[id]/movement/[movementId]/../../index.tsx` |
| 27 | 🟡 medium | optimization | mobile/db | get_home_stats aggregates the user's entire sets history to return the last 3 se | `database` |
| 28 | 🟡 medium | optimization | mobile/db | Unindexed foreign key personal_records_set_id_fkey | `database` |
| 29 | 🟡 medium | refactoring | monorepo | useMovements: DI-refactored shared copy is orphaned dead code while web+mobile r | `packages/shared/src/hooks/useMovements.ts` |
| 30 | 🟡 medium | refactoring | monorepo | Dead pre-DI hooks/workouts/ subfolder in packages/shared (567 lines, 10 files) | `packages/shared/src/hooks/workouts/` |
| 31 | 🟡 medium | refactoring | monorepo | Utility files identical across three trees, but shared copies mostly unexported  | `packages/shared/src/lib/utils/{validation,dateHelpers,workout-helpers,typeHelpers,logger};` |
| 32 | 🟡 medium | refactoring | monorepo | apps/web maintains its own useMuscleGroups/useTrackingTypes that duplicate share | `apps/web/src/hooks/useMuscleGroups.ts;` |
| 33 | 🟡 medium | refactoring | mobile/shared | mobile useMovements.ts is a 1,372-line fork of shared's DI-ready hook, and it ha | `apps/mobile/hooks/useMovements.ts` |
| 34 | 🟡 medium | refactoring | mobile/shared | Dead/unwired code in packages/shared: useMovements.ts and the entire hooks/worko | `packages/shared/index.ts` |
| 35 | 🟡 medium | refactoring | mobile/shared | Identical bottom-sheet Modal scaffold copy-pasted across 9+ files; three action  | `apps/mobile/components/WorkoutActionSheet.tsx` |
| 36 | 🟡 medium | refactoring | mobile/shared | Theme palette defined twice in two parallel systems (ThemeProvider CSS vars vs u | `apps/mobile/hooks/useThemeColors.ts` |
| 37 | ⚪ low | security | web/shared | Auth gating uses getSession() (unverified) rather than getUser() | `packages/shared/src/lib/auth/AuthProvider.tsx` |
| 38 | ⚪ low | security | db/mobile | SECURITY DEFINER functions (incl. trigger-only handle_new_user) are EXECUTE-able | `live` |
| 39 | ⚪ low | security | db/mobile | Deep-link handler creates a session from link-supplied access/refresh tokens (se | `apps/mobile/hooks/useDeepLink.ts` |
| 40 | ⚪ low | security | db/mobile | workout_groups RLS uses bare auth.uid() (per-row re-eval) and personal_records.s | `supabase/migrations/20251223000000_add_workout_groups.sql` |
| 41 | ⚪ low | security | db/mobile | Auth hardening gaps: leaked-password protection disabled and Postgres has outsta | `Supabase` |
| 42 | ⚪ low | correctness | shared | get_home_stats groups workout sessions by UTC day, splitting/merging late-night  | `supabase/migrations/20251230160000_add_home_stats_function.sql` |
| 43 | ⚪ low | correctness | web | Add-movements page resets in-progress selection whenever workoutMovements query  | `apps/web/src/app/workout/[workoutId]/movements/page.tsx` |
| 44 | ⚪ low | correctness | mobile | Confirm screen success state is dead code; timeout comment says 5s but is 10s | `apps/mobile/app/confirm.tsx` |
| 45 | ⚪ low | optimization | web/shared | useSetsCountByMovement over-fetches all rows/columns to count and collides with  | `packages/shared/src/hooks/useSets.ts` |
| 46 | ⚪ low | optimization | web/shared | useMovementLastSets mutates the caller's movementIds array via .sort() inside th | `packages/shared/src/hooks/useMovementLastSets.ts` |
| 47 | ⚪ low | optimization | mobile/db | workout_groups RLS policies use bare auth.uid() (per-row re-evaluation) | `database` |
| 48 | ⚪ low | optimization | mobile/db | Two redundant single-column indexes on the hot sets table; ~30 'unused' indexes  | `database` |
| 49 | ⚪ low | refactoring | monorepo | Dead shared createClient couples React Native AsyncStorage into the shared packa | `packages/shared/src/lib/supabase/client.ts` |
| 50 | ⚪ low | refactoring | monorepo | packages/ui is a phantom package: exports point to files that do not exist | `packages/ui/package.json` |
| 51 | ⚪ low | refactoring | monorepo | Root directory cluttered with 9 status-report .md docs and 145KB of committed cr | `/` |
| 52 | ⚪ low | refactoring | monorepo | Oversized apps/web route/component files past ~450 lines warrant decomposition | `apps/web/src/app/workout/[workoutId]/movement/[movementId]/settings/page.tsx` |
| 53 | ⚪ low | refactoring | mobile/shared | Oversized mobile screens mixing data orchestration, inline sub-components, and l | `apps/mobile/app/workout/[id]/movement/[movementId]/index.tsx` |
| 54 | ⚪ low | refactoring | mobile/shared | packages/shared/src/lib/supabase/client.ts is a platform-conflated module that t | `packages/shared/src/lib/supabase/client.ts` |


---

## 🔴 HIGH severity

### 1. Password-reset email link points to a nonexistent /auth/callback route
`security` · area **web/shared** · verified ✓ · reviewer confidence: high

**Where:** `apps/web/src/components/auth/ResetPasswordForm.tsx` (55 (redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`))

**What / why:** resetPasswordForEmail sets redirectTo to `${location.origin}/auth/callback?next=/auth/reset-password`, but there is NO route handler for /auth/callback anywhere in apps/web (no app/auth directory, and `find app -name route.ts` returns nothing). With @supabase/ssr's default PKCE flow the reset email contains a `code` that must be exchanged by a server route calling exchangeCodeForSession; because that route is missing, the user clicking the reset link lands on a 404 and the session is never established, so they cannot set a new password. Compounding this, the reset-password page (app/(auth)/reset-password/page.tsx) tries to detect the session via `searchParams.get('access_token')` / URL hash — the legacy implicit-flow shape — which never matches the PKCE `code` param, so even the fallback detection is dead. Net effect: account recovery is broken; a user who forgets their password is locked out.

**Fix:** Add an app/auth/callback/route.ts that reads `code`, calls `supabase.auth.exchangeCodeForSession(code)`, and redirects to the `next` path; or point redirectTo directly at /reset-password and exchange the code there. Align the reset-password page's token detection with the PKCE `code` param rather than access_token.

> **Verifier:** ResetPasswordForm.tsx:55 sets redirectTo to `${location.origin}/auth/callback?next=/auth/reset-password` (confirmed verbatim). App tree confirms no `/auth/callback` route: only the `(auth)` route group exists (produces /register, /reset-password, /login — groups add no path segment); no literal app/auth dir, no route.ts anywhere in apps/web/src/app, no middleware (ground truth). client.ts uses @supabase/ssr createBrowserClient with no flowType override => PKCE, so the email link delivers `?code=`; the browser lands on /auth/callback and 404s, code is never exchanged, no session, password never resettable. Reset page (page.tsx:29-31) detects via access_token/refresh_token/hash — legacy implicit-flow shape that never matches the PKCE code param, and onAuthStateChange SIGNED_IN can't fire without a successful exchange, so the fallback is dead too. Account recovery fully broken; users would notice being locked out. High is correct — functional break, not data loss/exposure/auth-bypass so not critical.

### 2. Dashboard library prefetch poisons shared movement-templates cache with an empty array (nonexistent `description` column)
`correctness` · area **web** · verified ✓ · reviewer confidence: high

**Where:** `apps/web/src/components/features/DashboardContent.tsx` (28-52 (queryKey line 29, select line ~37))

**What / why:** On the dashboard (home page), hovering the "Movement Library" link runs prefetchPage('library'), which calls queryClient.prefetchQuery with queryKey ['movements','templates'] — the EXACT key used by useMovementTemplates (movementKeys.templates() in useMovements.ts line 26). The prefetch's select string requests a `description` column on movement_templates, but that table has no `description` column (it has `instructions`; see database.types.ts line 93). PostgREST therefore returns a 400 error; the code ignores the error (`const { data } = await ...; return data || []`) and stores `[]` under ['movements','templates'] with staleTime 15 min. Reproduction: fresh dashboard load, hover "Movement Library", then navigate to /quick-log or /workout/[id]/movements. Both call useMovementTemplates() (quick-log/page.tsx:51, movements/page.tsx:81) with no initialData; React Query sees the freshly-prefetched `[]` as non-stale and does NOT refetch, so the Movement Library section renders EMPTY for up to 15 minutes — the user cannot add any template movement to a workout or quick-log. Even absent the column error, the prefetch stores RAW rows (nested tracking_types / movement_template_muscle_groups) instead of the transformed shape the hook produces (flat `muscle_groups: string[]` and `tracking_type: string`), which would break `movement.muscle_groups.some(...)` consumers.

**Fix:** Either drop this prefetch or make it produce the identical shape and key semantics as useMovementTemplates: replace `description` with `instructions`, apply the same transform to muscle_groups/tracking_type, and do NOT swallow the error into `[]` (let prefetchQuery reject so a poisoned empty result is never cached). Simplest fix: reuse getMovementTemplates()/the shared query function instead of hand-writing a divergent select.

> **Verifier:** Verified end-to-end. movement_templates.Row (database.types.ts:88-97) has instructions, no description; PostgREST 400s on the nonexistent column. DashboardContent.tsx:31-49 destructures only `const { data } = await ...` (ignores error) and `return data || []`, so the queryFn resolves with [] and prefetchQuery caches it under ["movements","templates"] with staleTime 15*60*1000 (lines 29,51). The actual consumer is the web-local hook apps/web/src/hooks/useMovements.ts:38, whose queryKey movementKeys.templates() = ["movements","templates"] and staleTime 15*60*1000 (lines 25,41,82) exactly match; quick-log/page.tsx:51 and workout/[workoutId]/movements/page.tsx:81 call it with no initialData. Fresh cached [] => no refetch on mount for up to 15 min => empty template library. Triggered by hovering the Library link (onMouseEnter, line 158) — no click needed. Finding cited the shared-package hook rather than the web copy, but key+staleTime are identical, so the mechanism holds (minor citation scope only). High, not critical: user-visible broken flow (can't add template movements), but no data loss/cross-user exposure/crash; custom user_movements use a separate key and stay intact.

### 3. Create/Update user-movement mutations cache raw DB rows, dropping muscle_groups & tracking_type (wrong UI + crash on library search)
`correctness` · area **web** · verified ✓ · reviewer confidence: high

**Where:** `apps/web/src/hooks/useMovements.ts` (413-427 (useCreateUserMovement.onSuccess) and 587-606 (useUpdateUserMovement.onSuccess))

**What / why:** Both mutationFns do `.insert/.update(...).select().single()` with NO joins, so the returned `data` contains only base user_movements columns — it has `tracking_type_id` but NOT the derived `tracking_type` string and NOT the `muscle_groups` array. onSuccess then writes this raw row into caches typed as the transformed UserMovement: userMovementsList (staleTime 10 min, line 147) and userMovement, replacing rows that previously had muscle_groups/tracking_type. Neither onSuccess invalidates userMovementsList, so the untransformed row persists ~10 minutes. Consequences: (1) Immediately after creating or editing a custom movement, the library/list shows it with no muscle groups and no tracking-type icon. (2) Hard crash: LibraryContentServer maps user movements to templates via `muscle_groups: userMovement.muscle_groups` (line 36) and the filter at line 81 calls `movement.muscle_groups.some(...)` WITHOUT optional chaining. Reproduction: edit a custom movement's muscle groups, return to the library, then search (or open /library/search/[term]) — `muscle_groups` is now undefined for that row, `.some` throws a TypeError, and the library view crashes into LibraryErrorBoundary until the 10-minute staleTime expires.

**Fix:** Have the insert/update select the same joined shape used by useUserMovement (tracking_types!inner(name), user_movement_muscle_groups(muscle_groups(...))) and run the same transform before caching; OR in onSuccess call queryClient.invalidateQueries({ queryKey: movementKeys.userMovements() }) instead of writing the raw row, so the list refetches the transformed shape. Independently, harden LibraryContentServer line 81 with optional chaining / default `[]`.

> **Verifier:** Code matches the claim. useCreateUserMovement.mutationFn (lines 354-361) and useUpdateUserMovement.mutationFn (lines 451-456) both do `.insert/.update(...).select().single()` with NO joins, so `data` is a bare user_movements row lacking `muscle_groups` (relational) and `tracking_type` (derived). Both onSuccess handlers write this raw `data` straight into the list cache (create: line 416-424 replacing temp- rows; update: line 590-595 `old.map(m => m.id===id ? data : m)`) and the individual cache (lines 426, 598). Neither invalidates userMovementsList (update invalidates only workoutMovements, line 602-604); list staleTime is 10min (line 147), so the poisoned row survives remount without refetch. Crash confirmed: LibraryContentServer.tsx line 36 sets `muscle_groups: userMovement.muscle_groups` (now undefined) and line 81 calls `movement.muscle_groups.some(...)` with no optional chaining — throws TypeError. It only runs when searchTerm is truthy (line 76 early-returns true otherwise), and the /library/search/[term] route plus LibraryErrorBoundary both exist, so it's reachable via create/edit-then-search. Severity high (not critical) is right: real uncaught crash on a common flow but gated behind a search interaction. Minor overreach: the "no tracking-type icon" consequence doesn't apply to this component, which derives tracking type from tracking_type_id (a present column) at lines 37-39, not the missing tracking_type field — but this doesn't affect the muscle_groups crash or severity.

### 4. Rest timer pause/resume ignores paused time — timer jumps forward or completes on resume
`correctness` · area **mobile** · verified ✓ · reviewer confidence: high

**Where:** `apps/mobile/components/RestTimerProvider.tsx` (tick ~L72-118, pauseTimer ~L137-146, resumeTimer ~L148-166)

**What / why:** tick derives remaining time from an absolute anchor: `elapsed = Math.floor((now - prev.startTime)/1000); newRemaining = prev.duration - elapsed`. pauseTimer only clears the interval and sets isPaused/pausedAt; resumeTimer only restarts the interval. Neither adjusts `startTime`, and `pausedAt` is never used to compensate. Concrete failure: start a 60s timer (startTime=T0). At T0+20s tap pause (UI shows 0:40). Rest 30s, tap resume at T0+50s. The next tick computes elapsed=51 → newRemaining=60-51=9, so the display jumps from 0:40 to 0:09. If the pause exceeds the remaining time, the first tick after resume computes newRemaining<=0 and immediately fires completion. Pause effectively only freezes the on-screen number while wall-clock keeps counting — the core feature is broken.

**Fix:** On resume, shift the anchor forward by the paused span: `startTime = startTime + (Date.now() - pausedAt)` (equivalently rebase startTime = Date.now() - (duration - remainingTime)*1000). Apply this in resumeTimer before restarting the interval so `duration - elapsed` again equals the frozen remainingTime.

> **Verifier:** Code matches the finding verbatim. tick L68-69: `elapsed = Math.floor((now - prev.startTime)/1000); newRemaining = prev.duration - elapsed` — absolute anchor. pauseTimer L145-151 clears interval, sets isPaused/pausedAt, never modifies startTime. resumeTimer L155-165 flips isPaused off, nulls pausedAt, restarts interval — never adjusts startTime, never reads pausedAt. Traced all pausedAt refs (L22,57,131,150,163,184): written, never read in any calc. Scenario reachable: pause at T0+20 (frozen 0:40), resume at T0+50 → next tick elapsed=51, newRemaining=9 → jumps to 0:09; if pause span > remaining, newRemaining<=0 hits L71 branch firing completeTimerNotification() immediately. resetTimer L184 correctly rebases startTime=Date.now(), proving the anchor-shift is the intended pattern omitted on resume. High is right: core feature, wrong user-visible result on common path, but no data loss/crash.

### 5. addTime does not re-sync the headless foreground-service timer, firing 'Rest Complete' early
`correctness` · area **mobile** · verified ✓ · reviewer confidence: high

**Where:** `apps/mobile/components/RestTimerProvider.tsx` (addTime ~L170-179; apps/mobile/services/notificationService.ts startTimerNotification/registerForegroundService)

**What / why:** The Android foreground service tracks its own completion using module-level `timerEndTime`, set only by startTimerNotification. addTime bumps React state `duration`/`remainingTime` (+30s) but never updates `timerEndTime`, and tick's updateTimerNotification does not touch it either. The headless interval in registerForegroundService keeps comparing against the original end time. Concrete failure: 60s timer with 10s left, user taps +30s (UI now shows 0:40 and keeps counting). ~10s later the headless loop sees remainingSeconds<=0, calls handleTimerComplete(), stops the foreground service, and posts the 'Rest Complete!' heads-up notification — ~30s early — while the in-app timer still shows ~0:30 and continues. It also sets completedByHeadless so the real React completion is later swallowed.

**Fix:** In addTime, after updating state also extend the headless anchor — e.g. call startTimerNotification(newDuration, newRemaining) (or expose an extendTimerNotification that does `timerEndTime += seconds*1000; timerDuration += seconds`). Do the same for resetTimer/resume paths so the foreground service end time always mirrors React state.

> **Verifier:** Code matches the claim. addTime (RestTimerProvider.tsx L189-198) only mutates React state (`duration + seconds`, `remainingTime + seconds`) with no notification call. The headless anchor `timerEndTime` is set solely in startTimerNotification (notificationService.ts L194 `timerEndTime = Date.now() + remainingTime*1000`); updateTimerNotification (L225-254, called by tick L100) never touches it. The headless loop (L106-150) fires `if (remainingSeconds <= 0) { await handleTimerComplete(); }` against the stale anchor, and handleTimerComplete (L43-45) sets `completedByHeadless = true`, which tick's wasCompletedByHeadless() (L75-79) later consumes to swallow the real completion. So on Android any +Ns tap makes the foreground service post 'Rest Complete!' N seconds early and suppress the correct-time alert. resetTimer/resumeTimer re-anchor via startTimerNotification; addTime is the sole omission. High is correct: Android-primary, common tail-of-rest interaction, user-visible early alert defeating the feature; not critical since in-app countdown stays correct and no data loss.

### 6. Password reset flow navigates to a non-existent /reset-password route
`correctness` · area **mobile** · verified ✓ · reviewer confidence: high

**Where:** `apps/mobile/hooks/useDeepLink.ts` (107 and 116 (also apps/mobile/app/login.tsx:206))

**What / why:** There is no app/reset-password.tsx (or any reset* file) in apps/mobile/app — the route set is (tabs), confirm, login, register, groups/modal, workout/*. Two code paths route there anyway: (1) the recovery deep-link handler does `router.replace('/reset-password')` after a successful verifyOtp/setSession for type==='recovery'; (2) login.tsx renders `<Link href="/reset-password">` under 'Forgot your password?'. Concrete failure: a user tapping the password-reset email link (or the Forgot-password link) is sent to a route expo-router cannot resolve, producing an 'Unmatched Route'/navigation error instead of a reset screen — password reset is entirely unusable, and in the recovery case the session was already exchanged so the user is stranded.

**Fix:** Add app/reset-password.tsx (a password-update screen using supabase.auth.updateUser) and register it in the Stack in app/_layout.tsx alongside login/register/confirm, and add it to the isAuthRoute check so an authenticated recovery session isn't bounced to '/'. Alternatively repoint both callers to an existing screen.

> **Verifier:** All cited code verified verbatim. useDeepLink.ts:107 and :116 both do `router.replace("/reset-password")` in the `type === "recovery"` branch (after verifyOtp/setSession already exchanged the session). login.tsx:206 renders `<Link href="/reset-password" asChild>`. No file matching `*reset*` exists under apps/mobile/app (routes: (tabs), workout, groups/modal, login, register, confirm), and grep for "reset-password" returns only the two callers + the Link — no target screen. Reachability confirmed: useDeepLink() is invoked in AuthProvider.tsx:46, which wraps the whole app via RootLayout, so the recovery deep-link path executes on any password-reset email tap; the Link path is always reachable from login. _layout.tsx Stack never registers reset-password and isAuthRoute omits it, so a recovery session is also bounced. Password reset is entirely broken on mobile. High is correct: broken user-facing auth flow with users stranded post-session-exchange, but not data loss/cross-user exposure/auth bypass, so not critical.

### 7. Dashboard 'library' prefetch poisons the movement-templates cache with an empty array (invalid column)
`optimization` · area **web/shared** · verified ✓ · reviewer confidence: high

**Where:** `apps/web/src/components/features/DashboardContent.tsx` (28-52 (queryKey line 30, select 'description' ~line 37))

**What / why:** prefetchPage('library') runs on hover of the 'Movement Library' nav link and prefetches queryKey ['movements','templates'] — the SAME key used by useMovementTemplates (apps/web/src/hooks/useMovements.ts:38-42). But the prefetch's queryFn selects a `description` column that does not exist on movement_templates (the table only has `instructions`; verified in packages/shared/src/types/database.types.ts). PostgREST returns error 42703, but the queryFn only destructures `data` (ignores `error`) and does `return data || []`, so it caches an empty array. useMovementTemplates has staleTime 15min and no refetchOnMount, so once poisoned the cache serves [] as fresh. Failure scenario: user hovers 'Movement Library' on the dashboard (prefetch resolves to []), then opens Quick Log or a workout's 'Add movements' page (both call useMovementTemplates() with no initialData) — the template list renders EMPTY for up to 15 minutes with no error shown.

**Fix:** Remove this prefetch or fix it to mirror the real hook: select `instructions` (not `description`), apply the same tracking_type/muscle_groups transform, and check `error`. Better: reuse the shared queryFn or drop the manual prefetch entirely since the library page already fetches templates server-side via getMovementTemplates().

> **Verifier:** Code matches the finding exactly. DashboardContent.tsx:31-49 prefetches queryKey ["movements","templates"] (line 29) selecting a `description` column (line 37) that does not exist — database.types.ts:88-98 shows movement_templates has only instructions/name/tags/experience_level/tracking_type_id/created_at/updated_at. supabase-js returns {data:null,error} without throwing; the queryFn destructures only `{ data }` and does `return data || []` (line 49), so [] is cached as a successful, fresh value with staleTime 15min (line 51). Consumer useMovements.ts:38-84 uses the identical key movementKeys.templates() (line 26/42), staleTime 15min (line 82), no refetchOnMount override; fresh data => no refetch on mount, so [] is served. Both consumers call useMovementTemplates() with no initialData (quick-log/page.tsx:51, workout/[workoutId]/movements/page.tsx:81). Library's server fetch (movement-templates.ts, uses `*`) does not write the client ["movements","templates"] key, so it is not a heal path for those two pages. Trigger is onMouseEnter over the Movement Library nav link (line 158) — easy/incidental. Result: empty template list, no error, up to 15min per SPA session; self-heals only on full reload. High is correct: user-noticeable broken core add-movement flow, no data-loss/security dimension.


---

## 🟡 MEDIUM severity

### 8. Open redirect in login flow via unsanitized redirectTo param
`security` · area **web/shared** · not independently verified · reviewer confidence: high

**Where:** `apps/web/src/components/auth/LoginForm.tsx` (80 (router.push(redirectTo)); source: app/(auth)/login/page.tsx:15)

**What / why:** LoginPage reads redirectTo straight from the query string (searchParams.redirectTo) and passes it to LoginForm, which after a successful sign-in calls router.push(redirectTo) with no validation. In the Next App Router, router.push() with an absolute/protocol-relative URL performs a full navigation to that origin. Failure scenario: an attacker sends a victim https://logset.app/login?redirectTo=https://evil.com/steal (or //evil.com). The victim sees the legitimate Logset login page, authenticates, and is then bounced to the attacker's site — a credential-phishing / OAuth-style redirect abuse primitive. Any auth tokens the attacker page can lure the user into re-entering, or a convincing fake 'session expired' re-login, are the payoff.

**Fix:** Before redirecting, reject any target that is not a same-origin relative path: e.g. `const safe = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'; router.push(safe);`. Apply the same guard wherever redirectTo is consumed.

### 9. No middleware: auth is client-only and server session refresh is dead code (defense-in-depth, not currently exploitable)
`security` · area **web/shared** · not independently verified · reviewer confidence: high

**Where:** `apps/web/src/lib/supabase/server.ts` (16-26 (setAll try/catch comment referencing nonexistent middleware))

**What / why:** There is no middleware.ts, and server.ts's setAll() swallows cookie writes with a comment saying they 'can be ignored if you have middleware refreshing user sessions' — that middleware does not exist. I verified the blast radius is currently limited: every protected page (e.g. app/page.tsx -> ProtectedRoute -> DashboardContent, workout/[workoutId]/page.tsx) is a client component that fetches via the browser Supabase client under RLS, so NO private data is server-rendered — there is no SSR leak, no cross-user FOUC, and the two server actions each refresh/write cookies fine because setAll works inside a Server Action context. So this is a defense-in-depth + trap-for-the-future issue, not an exploitable hole today: (1) all authorization rests on RLS being correct — any future Server Component that reads user data server-side would render with an unrefreshed/stale cookie and, if it ever queried without its own getUser() scoping, would leak; (2) the misleading comment invites a maintainer to add such a component believing session refresh 'just works'. Flagging distinctly from an exploitable finding per the reliance-by-accident guidance.

**Fix:** Either add a middleware.ts using @supabase/ssr's updateSession pattern (refreshes the session cookie at the edge and lets you server-gate protected routes), or correct the comment to state that session refresh happens only client-side and that server data access must not be added without an explicit getUser() ownership check. Do not let RLS remain the sole gate by accident.

### 10. Auth tokens stored in unencrypted AsyncStorage (refresh-token theft = account takeover)
`security` · area **db/mobile** · verified, severity-adjusted ✓ · reviewer confidence: high

**Where:** `apps/mobile/lib/supabase/client.ts` (31-38 (storage: AsyncStorage))

**What / why:** The Supabase client is configured with `storage: AsyncStorage` and `persistSession: true`, so the session — including the long-lived refresh_token — is written to AsyncStorage. AsyncStorage is unencrypted at rest: on Android it is a plaintext RKStorage SQLite/XML file in the app sandbox, on iOS an unencrypted file in the app container, and both are captured by unencrypted device backups. Failure scenario: a lost-but-unlocked, backed-up, or rooted/jailbroken device lets an attacker read the refresh_token; because refresh tokens are long-lived and can be exchanged for fresh access tokens via the Supabase token endpoint, the attacker gains persistent full access to the victim's account and all workout data even after the victim's app session ends. RLS does not help — the stolen token authenticates as the victim.

**Fix:** Back the auth storage with the OS keystore instead of AsyncStorage. Use expo-secure-store (Keychain / Android Keystore) as the `storage` adapter, e.g. a SecureStore-backed { getItem/setItem/removeItem } object; because SecureStore has a ~2048-byte per-value limit and the Supabase session JSON can exceed it, chunk the value or use a library like `react-native-mmkv` with encryption. This is the Supabase-documented pattern for React Native.

> **Verifier:** Code confirmed verbatim at apps/mobile/lib/supabase/client.ts:31-38: `storage: AsyncStorage, autoRefreshToken: true, persistSession: true`, with AsyncStorage imported at line 2. So the long-lived refresh_token is persisted to unencrypted AsyncStorage — a real weakness, and expo-secure-store is the correct Supabase-documented fix. RLS does not mitigate since a stolen token authenticates as the victim. However the scenario is NOT remotely reachable and does NOT expose data across users: it requires local device compromise (lost/unlocked device, unencrypted backup, or rooted/jailbroken device with filesystem access). iOS app-container files are already protected by full-device encryption at lock; the practical exposure is Android plaintext RKStorage, unencrypted backups, and rooted devices. That is a defense-in-depth gap, not the remote/cross-user/crash class that warrants high — hence medium.

### 11. sets INSERT policy omits user_movement ownership check; SECURITY DEFINER trigger writes cross-user aggregate rows
`security` · area **db/mobile** · not independently verified · reviewer confidence: high

**Where:** `supabase/migrations (sets RLS) + get from live: update_movement_last_sets()` (policy users_can_insert_own_sets (WITH CHECK auth.uid()=user_id); trigger update_movement_last_sets_on_insert on public.sets)

**What / why:** The `sets` INSERT policy only enforces `WITH CHECK ((select auth.uid()) = user_id)` — it never validates that the referenced `user_movement_id` belongs to the caller, and the FK `sets_user_movement_id_fkey` only enforces existence. The AFTER INSERT trigger `update_movement_last_sets` runs as SECURITY DEFINER (bypassing RLS) and recomputes/UPSERTs a `movement_last_sets` row deriving `user_id` and `movement_name` from the JOINed `user_movements` row (um.user_id), then aggregates MAX(created_at)/COUNT(id) over ALL sets on that movement. Failure scenario: attacker A inserts a set with user_id=A (passes WITH CHECK) but user_movement_id = victim B's movement UUID; the trigger fires as definer, recomputes B's aggregate now including A's injected set, and writes a movement_last_sets row owned by B with corrupted last_set_date/total_sets. B reads their own (RLS-permitted) cache and sees polluted data; A's set remains permanently attached to B's movement, corrupting every future recount. Precondition is knowing a victim user_movement UUID (not normally readable via RLS), which caps practical severity, but this is a genuine RLS-bypass integrity write across users. update_workout_movement_counts has the identical shape via workout_movements/workout_id.

**Fix:** Tighten the writable table's policy so cross-user references are impossible: change the sets INSERT (and UPDATE) WITH CHECK to also require the movement is owned by the caller, e.g. `WITH CHECK ((select auth.uid()) = user_id AND EXISTS (SELECT 1 FROM user_movements um WHERE um.id = user_movement_id AND um.user_id = (select auth.uid())))`; apply the analogous workout-ownership check to workout_movements for update_workout_movement_counts. Additionally have the trigger functions assert um.user_id = NEW.user_id before upserting.

### 12. 7 functions run without a pinned search_path (SECURITY DEFINER hardening)
`security` · area **db/mobile** · not independently verified · reviewer confidence: high

**Where:** `live DB functions (e.g. supabase/migrations/20251230160000_add_home_stats_function.sql get_home_stats)` (update_updated_at_column, update_movement_last_sets, reorder_workout_movements, handle_new_user, cleanup_migration_backup_24, update_workout_movement_counts, get_home_stats — none declare SET search_path)

**What / why:** None of the flagged functions pin search_path, and four of them are SECURITY DEFINER (get_home_stats, handle_new_user, update_movement_last_sets, update_workout_movement_counts) that reference tables by unqualified name (e.g. `movement_last_sets`, `user_movements`, `sets`, `workouts`). A SECURITY DEFINER function with a caller-controlled search_path is hijackable if an attacker can create a same-named object in a schema that precedes `public`: the definer (table-owner/superuser-adjacent role) would then execute attacker code. Assessment: NOT currently exploitable because Supabase does not grant anon/authenticated CREATE on any schema, so an attacker cannot shadow `public.sets` etc. This is defense-in-depth: the moment any role gains CREATE, or an unqualified function reference is added, it becomes a privilege-escalation path. get_home_stats itself is safe (it filters WHERE user_id = auth.uid()), but SECURITY DEFINER there is unnecessary.

**Fix:** Add `SET search_path = ''` (and schema-qualify every object, e.g. public.sets, public.movement_last_sets) to each function via CREATE OR REPLACE, prioritizing the four SECURITY DEFINER ones. Downgrade get_home_stats to SECURITY INVOKER (RLS already permits reading one's own rows) unless a definer is genuinely required.

### 13. Plaintext production Postgres superuser password committed in repo working tree
`security` · area **db/mobile** · not independently verified · reviewer confidence: medium

**Where:** `apps/mobile/.env` (SUPABASE_DATABASE_URL / DATABASE_URL lines; apps/mobile/.env.local SENTRY_AUTH_TOKEN)

**What / why:** apps/mobile/.env contains a live direct-connection Postgres URL with the `postgres` role password (postgresql://postgres:CER2Kjc6...@pvfimysvoikizuemevez.supabase.co:5432/postgres), and .env.local contains a Sentry auth token. The postgres role bypasses RLS entirely, so this single string grants full read/write to every user's data. Although .gitignore lists `.env*` (so it may be untracked), the secret sits in plaintext in the working tree and is trivially leaked via backups, screen-shares, or an accidental `git add -f`. Note for scope: the EXPO_PUBLIC_SUPABASE_ANON_KEY embedded in app.json and the RN bundle is the publishable key and is EXPECTED to be public (protected by RLS) — that is NOT a vulnerability; the DB password and Sentry token are.

**Fix:** Rotate the Postgres password and the Sentry token immediately (assume compromised). Remove the connection string from apps/mobile/.env (a client app never needs a direct DB URL); keep server-only secrets out of the mobile package entirely and load them from a secrets manager/CI only. Verify neither file is tracked (git ls-files) and purge from history if it ever was.

### 14. useBackgroundSync overwrites the full workouts list cache with only 5 rows (wrong order, missing group join)
`correctness` · area **shared** · verified, severity-adjusted ✓ · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useBackgroundSync.ts` (34-46 (prefetch) vs workouts/useWorkouts.ts:20-41)

**What / why:** useWorkouts caches ALL workouts under workoutKeys.list(user.id) = ["workouts","list",userId], selecting "*, workout_groups(name)" ordered by order_index asc. useBackgroundSync.prefetchQuery targets the SAME key but runs a different query: .select("*") (no workout_groups join), .order("created_at", desc), .limit(5). Background sync fires 2s after mount, on tab re-focus (visibilitychange), and on network reconnect. Whenever the existing cache is older than the prefetch staleTime (2 min) — e.g. user switches tabs away and back — prefetchQuery refetches and overwrites the cache. Failure scenario: a user with 12 workouts opens the app, works for a few minutes, switches tabs and returns; the workouts screen now shows only 5 workouts, sorted by created_at instead of order_index, and every workout.workout_groups is undefined so group-name labels vanish — until the next useWorkouts refetch.

**Fix:** Do not reuse the canonical list key for a truncated/differently-shaped prefetch. Either prefetch under a distinct key (e.g. ["workouts","dashboard-recent",userId]) or make the prefetch query identical to useWorkouts (same select, same order, no limit).

> **Verifier:** Bug is real and reachable. useBackgroundSync.ts:34-46 prefetches queryKey ["workouts","list",user.id] with .select("*").order("created_at",desc).limit(5); the canonical reader (the EXPORTED packages/shared/src/hooks/useWorkouts.ts:50, not the finding's cited non-exported workouts/useWorkouts.ts duplicate) uses the identical workoutKeys.list(userId)=["workouts","list",userId] with .select("*, workout_groups(name)").order("order_index",asc). prefetchQuery refetches+overwrites the shared cache when it's older than the 2-min prefetch staleTime, yielding 5 rows, wrong order, and no workout_groups join. Mounted in prod via BackgroundSyncProvider at app/layout.tsx:65 -> web useBackgroundSync wrapper -> shared hook; fires on visibilitychange/online/+2s. BUT severity high is inflated: useWorkouts has refetchOnMount:"always" (line 69) plus default refetchOnWindowFocus, so the same focus event and any remount re-fetch the correct query — the corruption is a transient stale-while-revalidate flash that self-heals, not persistent wrong data, no data loss/exposure. Note also the finding miscited the reader file path (workouts/useWorkouts.ts is a stale duplicate; the wired one is src/hooks/useWorkouts.ts), though the collision is identical in both.

### 15. useCreateSet optimistic insert into the main sets list is never rolled back on error
`correctness` · area **shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useSets.ts` (249-252 (onMutate) and 256-264 (onError))

**What / why:** onMutate optimistically prepends the temp set to TWO caches — setKeys.byMovement (line 240) and setKeys.list(user.id) (line 249) — but returns only { previousSets } snapshotted from the byMovement cache (line 225). onError restores only setKeys.byMovement. The setKeys.list(user.id) insert is never reverted, and there is no onSettled invalidation. Failure scenario: user logs a set while offline / the insert 500s; the byMovement list correctly rolls back, but the global sets list (used by the all-sets view / stats) keeps a phantom set with id "temp-..." indefinitely until an unrelated refetch. The phantom row also has rpe:null and a client timestamp, so any aggregation over setKeys.list double-counts it.

**Fix:** Snapshot setKeys.list(user.id) in onMutate and restore it in onError, or add an onSettled that invalidates both setKeys.list(user.id) and the byMovement key.

### 16. useMovementLastSets mutates the caller's movementIds array in place via .sort()
`correctness` · area **shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useMovementLastSets.ts` (23)

**What / why:** queryKey: ["movement-last-sets", user?.id, movementIds.sort()] calls Array.prototype.sort(), which sorts IN PLACE and returns the same reference. movementIds is a prop/arg typically derived from a list of the user's movements (often the same array instance used to render the movement list). Failure scenario: a component passes its movements-in-display-order id array; this hook silently reorders that array, so a sibling component or the same component's subsequent render that relies on the original order now shows movements in id-sorted order instead of the intended (e.g. name-sorted) order. It also defeats key stability if the caller mutates the array between renders.

**Fix:** Copy before sorting: [...movementIds].sort() (and apply the same copy inside the queryFn if order matters there).

### 17. useDuplicateWorkout produces an empty workout — it never copies workout_movements
`correctness` · area **shared** · not independently verified · reviewer confidence: medium

**Where:** `packages/shared/src/hooks/workouts/useDuplicateWorkout.ts` (23-62)

**What / why:** The mutation fetches the original workouts row, strips id/created_at/updated_at, and inserts a copy named "<name> (Copy)". It never reads or re-inserts the workout_movements rows that define the workout's exercises. Failure scenario: a user duplicates a workout containing 6 exercises; the new "... (Copy)" workout is created but opens completely empty (0 movements), so the user must re-add every exercise by hand — the opposite of what "duplicate" implies.

**Fix:** After inserting the new workout, select the original's workout_movements (user_movement_id, order_index, workout_notes) and batch-insert them with workout_id = newWorkout.id, then invalidate movementKeys.workoutMovementsList(newWorkout.id) and workout-movement-counts.

### 18. Sign-out from Settings navigates to nonexistent /auth route (404)
`correctness` · area **web** · not independently verified · reviewer confidence: high

**Where:** `apps/web/src/components/features/SettingsContent.tsx` (140)

**What / why:** handleSignOut does `await signOut(); router.push('/auth')`. There is no /auth route in the App Router — auth pages live under the (auth) route group as /login, /register, /reset-password (the group name does not appear in the URL). Every other sign-in/out path in the app pushes or links to '/login' (ProtectedRoute default redirectTo='/login'; UpdatePasswordForm.tsx:103; RegisterForm/ResetPasswordForm links). Reproduction: open Settings, click "Sign out" — the app pushes /auth, which renders Next's not-found page (404). ProtectedRoute cannot save this because /auth is not wrapped by it. Result is a broken landing on a common action.

**Fix:** Change to router.push('/login') to match the actual route and the rest of the codebase.

### 19. Shared useBackgroundSync uses web-only document/window APIs — throws on React Native
`correctness` · area **mobile** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useBackgroundSync.ts` (useEffect ~L74-100 (document.hidden, document.addEventListener, window.addEventListener))

**What / why:** The hook's effect references `document.hidden`, `document.addEventListener('visibilitychange', ...)` and `window.addEventListener('online', ...)`. On React Native there is no `document`, so this throws `ReferenceError: document is not defined` inside the effect the moment the hook mounts. The mobile wrapper apps/mobile/hooks/useBackgroundSync.ts wires it up for native. It is currently latent because no mobile screen imports the wrapper (grep shows only the wrapper file references it), so it does not cause today's cold start to fail — but the moment someone mounts it (its obvious intended use for dashboard prefetch), the Home screen tree throws and unmounts. This is a native/web platform-conditional bug.

**Fix:** Split platform impls (useBackgroundSync.native.ts using AppState.addEventListener('change') and NetInfo instead of visibilitychange/online), or guard with `typeof document !== 'undefined'`. Keep the web-DOM version behind the web entry only.

### 20. Dashboard prefetches write to query keys that don't match their consumer hooks (wasted requests, zero cache hits)
`optimization` · area **web/shared** · not independently verified · reviewer confidence: high

**Where:** `apps/web/src/components/features/DashboardContent.tsx` (55-118)

**What / why:** Three of the four prefetch targets use keys that differ from the hooks that actually read that data, so every hover fires network requests that can never be read from cache: muscle_groups is prefetched under ['muscle_groups'] but useMuscleGroups reads ['muscle-groups','list']; tracking_types is prefetched under ['tracking_types'] but useTrackingTypes reads ['tracking_types','active']; the settings prefetch uses ['user_profile'] but useUserProfile reads ['user_profiles', userId]; and ['analytics','overview'] is not read by any hook. Failure scenario: hovering Analytics/Library/Settings issues 1-3 Supabase requests each that populate orphan cache entries, so the target page still cold-fetches everything on mount — the prefetch adds load without improving navigation.

**Fix:** Import and use the same query-key factories the hooks use (muscleGroupKeys.lists(), trackingTypeKeys.active(), profileKeys.profile(user.id)) for the prefetch keys, or delete the ineffective prefetches.

### 21. Background sync prefetches the workouts list under the same key but with a truncated, differently-shaped query
`optimization` · area **web/shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useBackgroundSync.ts` (34-46)

**What / why:** syncCriticalData prefetches queryKey ['workouts','list', user.id] — identical to useWorkouts' key (workoutKeys.list) — but with a divergent query: `.select('*')` (no `workout_groups(name)` join), `.order('created_at', desc)`, and `.limit(5)`. useWorkouts instead selects `*, workout_groups(name)` ordered by `order_index` asc with no limit. Because the keys collide, whichever runs first wins the cache. Failure scenario: on tab focus / reconnect / 2s-after-mount, background sync overwrites the workouts-list cache with only the 5 most-recent workouts, in created_at order, missing the workout_groups.name field the dashboard renders — so the dashboard can briefly show 5 workouts in the wrong order with blank group labels until useWorkouts refetches.

**Fix:** Give the background-sync prefetch its own distinct key (e.g. ['workouts','recent', user.id]) or make its queryFn exactly match useWorkouts (same select, order, no limit) so the shared cache entry stays consistent.

### 22. refetchOnMount:'always' on core dashboard queries defeats their configured staleTime
`optimization` · area **web/shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useWorkouts.ts` (67-69)

**What / why:** useWorkouts sets staleTime 3min/gcTime 15min but also refetchOnMount:'always', and useWorkoutMovementCounts (apps/web/src/hooks/useWorkoutMovementCounts.ts:28-31) sets staleTime 5min but refetchOnMount:'always'. refetchOnMount:'always' overrides staleTime, so every time the dashboard component mounts (each client-side navigation back to '/') both the full workouts list and the movement-counts query re-hit Supabase regardless of freshness. Failure scenario: user navigates dashboard -> workout -> back -> workout -> back; each return refetches the entire workouts list + counts even though the data is seconds old, negating the cache. Cross-check: DASHBOARD_CACHE_FIX.md claims this change 'maintains good performance with intelligent caching,' but always-refetch is what disables the caching for these two queries.

**Fix:** Drop refetchOnMount:'always' and rely on staleTime plus targeted invalidation from the mutations (which already invalidate ['workout-movement-counts'] and the workouts list). If a freshness guarantee is needed on return, use a shorter staleTime instead of forcing a refetch on every mount.

### 23. Editing one movement invalidates every workout's movement list (over-broad invalidation)
`optimization` · area **web/shared** · not independently verified · reviewer confidence: medium

**Where:** `apps/web/src/hooks/useMovements.ts` (600-604 (shared copy: packages/shared/src/hooks/useMovements.ts:866-868))

**What / why:** useUpdateUserMovement.onSuccess already surgically updates the userMovements list, the individual movement, and (in the shared copy) each cached workout_movements entry via setQueryData, then still calls invalidateQueries({ queryKey: movementKeys.workoutMovements() }) — the prefix ['movements','workout'] — which marks EVERY cached workout's movement list stale, not just workouts containing the edited movement. Failure scenario: a user who has opened 10 different workouts (10 cached workoutMovementsList entries) edits a single movement's rest timer; all 10 heavy joined workout_movements queries are invalidated and refetch on next access, even the ones that don't include that movement.

**Fix:** Since onSuccess already writes fresh server data into each workout_movements cache, drop the blanket invalidation, or narrow it with a predicate that only invalidates lists whose cached data actually contains user_movement.id === id.

### 24. Entire set history rendered in a ScrollView with no virtualization
`optimization` · area **mobile/db** · verified, severity-adjusted ✓ · reviewer confidence: high

**Where:** `apps/mobile/app/workout/[id]/movement/[movementId]/index.tsx` (327-576 (ScrollView + Object.entries(groupedSets).map at 451, dateSets.map at 491))

**What / why:** The set-history section maps every grouped session and every set inside a plain ScrollView. A movement trained regularly accumulates hundreds of sets (e.g. bench pressed 3x/week for a year ≈ 150 sessions x 3-5 sets = 500+ rows). All rows mount eagerly with no windowing, so opening a well-used movement causes a slow first paint, high memory, and scroll jank. The `.sort()` over Object.entries and per-row per-tracking-type branching also re-runs on every render of this screen.

**Fix:** Replace the ScrollView history with a SectionList (or FlashList with getItemType) keyed by date section, so only on-screen rows mount. Keep the input controls as the ListHeaderComponent. This bounds mounted rows to the viewport regardless of history length.

> **Verifier:** Facts confirmed. index.tsx:327 `<ScrollView>` wraps the history; line 451 `Object.entries(groupedSets).sort(...).map` and line 491 `dateSets.map((set) => <View key={set.id}>...` render every session/set with no FlatList/SectionList/windowing. Fetch is unbounded: packages/shared/src/hooks/useSets.ts:122-132 `useSetsByMovement` selects sets `.eq(user_movement_id).order(created_at desc)` with no .limit()/.range(), so all historical sets mount eagerly — each row a nested View+Text+TouchableOpacity subtree. Severity lowered to medium: (1) impact is gradual and only material for the most-trained movements after heavy long-term history (~500 rows ≈ a year of 3x/week); new/moderate users have small history and no issue; (2) a few hundred simple rows in a RN ScrollView is perceptible jank on low-end devices, not a crash or hard cliff on a common path. Minor correction to the finding's claim that the sort/branch "re-runs on every render": groupedSets is memoized on [sets] (line 268), only the JSX .sort().map() re-runs.

### 25. RestTimer context value rebuilt every tick forces 1Hz re-render of set-logging screens
`optimization` · area **mobile/db** · verified, severity-adjusted ✓ · reviewer confidence: high

**Where:** `apps/mobile/components/RestTimerProvider.tsx` (247-257 (Provider value); tick/setState at 63-103, 138)

**What / why:** The provider passes a fresh object `value={{ ...state, startTimer, ... }}` on every render, and `tick` calls setState every 1000ms while a timer runs. Because the value identity changes each tick, every component that calls useRestTimer re-renders each second regardless of which fields it reads. useCreateSet (packages/shared/src/hooks/useSets.ts) calls `useRestTimer()` to get startTimer, and MovementDetailScreen uses useCreateSet — so while a rest timer counts down after logging a set, the movement-detail screen (including its unvirtualized set-history list, previous finding) re-renders once per second, producing sustained jank during the exact moment the user is resting between sets.

**Fix:** Split the context into a fast-changing state context (isActive/remainingTime/etc.) and a stable actions context whose value is memoized once (startTimer/pause/resume/... never change identity). Consumers that only need actions (useCreateSet) subscribe to the stable actions context and stop re-rendering each tick. Only the RestTimer UI subscribes to the ticking state.

> **Verifier:** Mechanism fully confirmed in code. RestTimerProvider.tsx:247-256 passes value={{...state, startTimer, ...}} — fresh object literal every render, no useMemo. tick (63-103) calls setState via setInterval(tick,1000) at line 138, so the Provider re-renders each second and mints a new value identity. useRestTimer (RestTimerContext.tsx) does useContext with no selector, so every consumer re-renders on any change. packages/shared/src/hooks/useSets.ts:190 `const { startTimer } = useRestTimer();` — useCreateSet needs only the stable action but subscribes to the whole ticking value. The mobile movement screen (app/workout/[id]/movement/[movementId]/index.tsx:141 useCreateSet(), delegating to the shared hook) thus re-renders 1x/sec while resting, and its set history is an unvirtualized ScrollView+nested .map (lines 327/456/491). Severity inflated: the cost is bounded and non-compounding — one reconcile per second, one screen, only during the ~60s rest window; groupedSets is useMemo'd (line 268) with deps unchanged per tick, so each tick is pure reconciliation of a single movement's small set-history tree, a few ms, not frame-dropping jank. Real jank would require a huge list, which is the separate virtualization finding's domain. Genuine wasted-render / maintainability issue, correct fix (split stable actions context from ticking state context) — medium, not high.

### 26. DraggableFlatList inline renderItem plus O(n^2) last-set lookup per row
`optimization` · area **mobile/db** · not independently verified · reviewer confidence: high

**Where:** `apps/mobile/app/workout/[id]/movement/[movementId]/../../index.tsx (app/workout/[id]/index.tsx)` (361-420 (renderItem at 363, getLastSetDate at 323/407))

**What / why:** renderItem is a large inline closure recreated on every parent render (and during drag the list re-renders frequently), giving every row a new render function identity and defeating row memoization. Inside each row, getLastSetDate calls `lastSetsData.find(...)` — a linear scan — so rendering N movements is O(N^2). Movements per workout are usually small so this is not catastrophic today, but both issues make drag reordering and any parent state change (action sheets, sync) re-reconcile the whole list unnecessarily.

**Fix:** Extract a memoized Row component (React.memo) passed via a stable renderItem, and precompute a `Map<user_movement_id, last_set_date>` once (useMemo over lastSetsData) so per-row lookup is O(1).

### 27. get_home_stats aggregates the user's entire sets history to return the last 3 sessions
`optimization` · area **mobile/db** · not independently verified · reviewer confidence: high

**Where:** `database: public.get_home_stats()` (recent_activity subquery)

**What / why:** The weekly-volume queries are correctly bounded and served by idx_sets_created_at (user_id, created_at DESC). But the recent-activity subquery filters only `s.user_id = current_user_id AND s.workout_id IS NOT NULL`, GROUP BYs by workout and day over the full history, then ORDER BY MAX(created_at) LIMIT 3. It scans and groups every set the user has ever logged on each home-screen load just to surface 3 recent sessions. At 81 rows this is instant; for a multi-year user with thousands of sets it becomes a full-history aggregation on the hottest screen.

**Fix:** Bound the inner scan to a recent window before grouping, e.g. add `AND s.created_at >= now() - interval '90 days'` (or a CTE that first selects the last ~90 days), so the aggregation reads a small slice via idx_sets_created_at. If a user could go >90 days without training, fall back to a second unbounded query only when the bounded one returns nothing.

### 28. Unindexed foreign key personal_records_set_id_fkey
`optimization` · area **mobile/db** · not independently verified · reviewer confidence: high

**Where:** `database: public.personal_records (set_id)` (FK personal_records_set_id_fkey)

**What / why:** personal_records has indexes on (user_movement_id, record_type), (user_id), (user_id, user_movement_id) and the unique keys, but none on set_id. Every DELETE (or key UPDATE) of a row in sets must verify no personal_records row references it; without an index that check is a sequential scan of personal_records. personal_records is currently empty so the cost is zero today, but set deletion is a normal user action and this scan grows linearly with PR count.

**Fix:** CREATE INDEX idx_personal_records_set_id ON public.personal_records(set_id); Expected win: FK enforcement on set delete becomes an index lookup instead of a seq scan.

### 29. useMovements: DI-refactored shared copy is orphaned dead code while web+mobile run full duplicates that have already drifted
`refactoring` · area **monorepo** · verified, severity-adjusted ✓ · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useMovements.ts (1511 lines); apps/web/src/hooks/useMovements.ts (1175); apps/mobile/hooks/useMovements.ts (1372)` (packages/shared/index.ts:3-11 (barrel omits useMovements))

**What / why:** packages/shared/src/hooks/useMovements.ts is fully refactored to the HookDependencies DI seam (every export takes `deps: HookDependencies`, all 13 hooks present incl. useDeleteWorkoutMovement) — identical in shape to useSets/useWorkouts which ARE consolidated. But it is not listed in packages/shared/index.ts and grep shows zero importers outside the file itself, so it is dead code. Meanwhile apps/web/src/hooks/useMovements.ts and apps/mobile/hooks/useMovements.ts each contain a complete second/third copy of the same query logic, calling createClient() directly (web line 39, mobile lines 52,103,173...). The copies have ALREADY diverged: the web copy is MISSING useDeleteWorkoutMovement (grep -c = 0) which both mobile and shared have (grep -c = 1). Failure scenario: a fix to movement-template muscle-group query logic (e.g. the createMuscleGroupRelationships path at web:286) must be made in 2-3 places and will be missed in at least one, exactly as the delete-hook divergence shows.

**Fix:** Finish the migration that was started: add `export * from "./src/hooks/useMovements"` to packages/shared/index.ts, then replace apps/web/src/hooks/useMovements.ts and apps/mobile/hooks/useMovements.ts with thin wrappers that call the shared hooks with `{ user, supabase }` — exactly like apps/web/src/hooks/useSets.ts already does. Reconcile the one behavioral gap (web's missing useDeleteWorkoutMovement) against the shared implementation during the swap. Net: ~2,500 lines deleted, three-way drift surface eliminated.

> **Verifier:** All factual claims verified. index.ts barrel omits useMovements (exports useSets/useWorkouts/... but not useMovements). packages/shared/src/hooks/useMovements.ts is fully DI-refactored: 13 exported hooks, useDeleteWorkoutMovement(deps: HookDependencies) at line 1450; zero external importers => dead code. apps/web/src/hooks/useMovements.ts imports createClient from @/lib/supabase/client and calls createClient() inline (lines 39,90,154,...), no shared wrapper — unlike apps/web/src/hooks/useSets.ts which is a thin wrapper (return useSetsShared({user, supabase})). Drift confirmed: grep -c useDeleteWorkoutMovement = web 0, mobile 1 (line 1256), shared 1. Severity lowered from high to medium: this is a maintainability/dead-code/duplication finding with no current user-facing consequence. The cited divergence is NOT a functional gap — web intentionally uses useRemoveMovementFromWorkout (MovementList.tsx:9,44) while useDeleteWorkoutMovement is mobile-only (workout/[id]/index.tsx:56, movement/[movementId]/index.tsx:156). No wrong result, security weakness, or perf cliff => rubric medium ("meaningful maintainability cost"), not high.

### 30. Dead pre-DI hooks/workouts/ subfolder in packages/shared (567 lines, 10 files)
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/workouts/ (index.ts, useWorkouts.ts, useWorkout.ts, useCreateWorkout.ts, useUpdateWorkout.ts, useDeleteWorkout.ts, useArchiveWorkout.ts, useDuplicateWorkout.ts, useReorderWorkouts.ts, types.ts)` (packages/shared/src/hooks/workouts/useWorkouts.ts:2-6)

**What / why:** This subfolder is a superseded pre-DI generation of the workout hooks: workouts/useWorkouts.ts imports `useAuth` and `createClient` directly (`import { createClient } from "../../lib/supabase/client"`) instead of the HookDependencies seam used by the live top-level packages/shared/src/hooks/useWorkouts.ts. The barrel (packages/shared/index.ts) exports the top-level ./src/hooks/useWorkouts, NOT this folder, and grep for `hooks/workouts` finds zero importers anywhere in apps or packages. It is pure dead code that still type-checks and lints on every CI run and misleads readers into thinking two workout-hook APIs exist. Failure scenario: a maintainer edits the wrong (dead) useCreateWorkout and the change silently has no effect.

**Fix:** Delete the entire packages/shared/src/hooks/workouts/ directory. If any of its hooks (useArchiveWorkout, useDuplicateWorkout, useReorderWorkouts) contain logic not yet present in the top-level DI files, port that logic into the top-level files first, then delete.

### 31. Utility files identical across three trees, but shared copies mostly unexported so apps consume their own
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/lib/utils/{validation,dateHelpers,workout-helpers,typeHelpers,logger}; apps/web/src/lib/utils/*; apps/mobile/lib/utils/*` (packages/shared/index.ts:16 (only dateHelpers is exported))

**What / why:** diff confirms apps/web/src/lib/utils/validation.ts, dateHelpers.ts are byte-identical to the shared copies, and workout-helpers.ts / typeHelpers.tsx differ ONLY by import path. Yet packages/shared/index.ts exports only dateHelpers from utils — validation, workout-helpers, typeHelpers and logger are not exported, so the shared copies are unreachable dead code and each app imports its own local duplicate. Even dateHelpers, which IS exported, has a redundant identical copy in apps/web. Failure scenario: isSafeForQueries (validation.ts) is used both by shared hooks (packages/shared/src/hooks/useWorkouts.ts:8) and app code via separate copies; a hardening fix to that guard must be applied in up to 3 files and any missed copy leaves an injection-style query path unhardened.

**Fix:** Export validation, workout-helpers, typeHelpers and logger from packages/shared/index.ts (fixing their internal import paths to relative), delete the per-app copies, and repoint app imports to @fitness/shared. Delete the redundant web dateHelpers copy.

### 32. apps/web maintains its own useMuscleGroups/useTrackingTypes that duplicate shared useReferenceData
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: high

**Where:** `apps/web/src/hooks/useMuscleGroups.ts; apps/web/src/hooks/useTrackingTypes.ts` (packages/shared/src/hooks/useReferenceData.ts:16,40)

**What / why:** packages/shared/src/hooks/useReferenceData.ts already exports DI versions of useTrackingTypes (line 16) and useMuscleGroups (line 40), and mobile consumes them via its useReferenceData wrapper. The web app instead ships standalone apps/web/src/hooks/useMuscleGroups.ts and useTrackingTypes.ts that re-implement the same `select` against the same reference tables with their own createClient() and their own query-key namespaces. There is no web useReferenceData at all. Failure scenario: a change to how muscle groups are ordered/filtered (e.g. adding an is_active filter) is made in shared useReferenceData for mobile but the web screens keep the old behavior, producing platform-divergent reference lists.

**Fix:** Add a web hooks/useReferenceData.ts wrapper over the shared hooks (matching the mobile pattern) and delete apps/web/src/hooks/useMuscleGroups.ts and useTrackingTypes.ts, repointing web imports.

### 33. mobile useMovements.ts is a 1,372-line fork of shared's DI-ready hook, and it has diverged (missing template COALESCE fallback)
`refactoring` · area **mobile/shared** · verified, severity-adjusted ✓ · reviewer confidence: high

**Where:** `apps/mobile/hooks/useMovements.ts` (101-170 (useUserMovements); whole file 1-1372)

**What / why:** packages/shared/src/hooks/useMovements.ts already exposes all 13 movement hooks accepting deps: HookDependencies (the exact pattern apps/mobile/hooks/useSets.ts wraps in ~30 lines). Mobile instead ships a full parallel re-implementation with 13 local createClient() calls and useAuth() reads. The forks have diverged in behavior: shared useUserMovements does a LEFT JOIN to movement_templates and COALESCEs name/personal_notes/experience_level/muscle_groups to the template when the user hasn't customized them; mobile's copy does 'simpler joins' with no template join and no COALESCE. Failure scenario: a user creates a movement from a template and never edits its name/notes; on web (shared logic) the movement shows the template's name and instructions, on mobile it renders the raw user_movements row so those fields come back empty/null. Any future query fix in shared never reaches mobile.

**Fix:** Export useMovements from packages/shared/index.ts, then replace apps/mobile/hooks/useMovements.ts with a thin wrapper file that injects { user, supabase } into the shared hooks — mirroring apps/mobile/hooks/useSets.ts. Do the same for apps/web. Delete the ~1,300 lines of forked query logic so there is one source of truth.

> **Verifier:** Fork is real: apps/mobile/hooks/useMovements.ts is 1,372 lines with 13 local createClient()/useAuth() hooks, while shared exposes DI-ready hooks (HookDependencies) that useSets.ts wraps in ~108 lines. Divergence is real: shared useUserMovements (packages/shared/src/hooks/useMovements.ts:142-187) joins movement_templates and COALESCEs name/personal_notes/experience_level/muscle_groups; mobile's copy (apps/mobile/hooks/useMovements.ts:110-160) has no template join and no COALESCE. BUT the finding's headline scenario is wrong: mobile persists name at creation (apps/mobile/app/workout/[id]/index.tsx:239 `name: template.name`) and muscle_groups via relationships, so those are non-null and render fine. The genuinely reachable divergence is personal_notes and experience_level: the create insert (index.tsx:236-242) never persists them (only optimistic UI at :249,:252), so DB stays NULL, and mobile's non-COALESCE query returns blank where web shows template instructions — displayed at movement/[movementId]/index.tsx:345 and settings.tsx:168,172. This is a duplication/maintainability issue plus a modest user-visible bug (blank notes on template-derived movements), not wrong numbers/data loss/auth — high is inflated; medium is correct.

### 34. Dead/unwired code in packages/shared: useMovements.ts and the entire hooks/workouts/ folder are never exported, forcing per-app forks
`refactoring` · area **mobile/shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/index.ts` (1-18)

**What / why:** index.ts exports useSets/useWorkouts/useHomeStats/etc. but omits `export * from './src/hooks/useMovements'`. So the 1,511-line DI-ready shared useMovements.ts is unreachable through @fitness/shared, which is why all three apps fork it. Separately, packages/shared/src/hooks/workouts/ is a fully decomposed per-operation implementation (useCreateWorkout, useArchiveWorkout, useDuplicateWorkout, ...) that nothing imports — the exported one is the monolithic useWorkouts.ts. lib/supabase/client.ts, lib/auth/AuthProvider.tsx, and lib/utils/{validation,workout-helpers,typeHelpers,logger} are likewise not exported while per-app copies exist. Failure scenario: a maintainer edits shared/src/hooks/workouts/useDuplicateWorkout.ts believing it is live; the change has zero effect because the monolith is what ships, and the divergence goes unnoticed.

**Fix:** Pick one workouts implementation (keep the decomposed hooks/workouts/ folder, delete the monolith or vice-versa) and export it. Export useMovements. Delete the unexported duplicate trees and the platform-conflated lib/supabase/client.ts (see separate finding) so shared has a single wired surface.

### 35. Identical bottom-sheet Modal scaffold copy-pasted across 9+ files; three action sheets plus a 4th inline copy differ only by their button list
`refactoring` · area **mobile/shared** · not independently verified · reviewer confidence: high

**Where:** `apps/mobile/components/WorkoutActionSheet.tsx` (WorkoutActionSheet 24-115; MovementActionSheet.tsx 26-88; GroupActionSheet.tsx 20-66; plus inline SetActionModal in app/workout/[id]/movement/[movementId]/index.tsx:52)

**What / why:** The same scaffold — <Modal transparent animationType='fade'> + <Pressable className='flex-1 bg-black/50 justify-end'> + <View className='bg-card rounded-t-3xl overflow-hidden pb-8 border-t border-border'> + grabber handle + title header + a Cancel button styled 'mx-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl' — is duplicated in at least 9 files (WorkoutActionSheet, MovementActionSheet, GroupActionSheet, EditSetSheet, AddMovementSheet, CreateCustomMovementForm, FilterPicker, and inline in three settings screens + the movement detail screen's SetActionModal). WorkoutActionSheet, MovementActionSheet, GroupActionSheet and the inline SetActionModal are near-identical: header-with-grabber, a vertical list of outline Buttons, TimedConfirmDeleteButton, Cancel. Failure scenario: MovementActionSheet puts its Pressable backdrop as a sibling of the sheet View while the others nest the sheet inside the Pressable — a structural inconsistency that already causes subtly different tap-to-dismiss behavior, and any styling fix (e.g. safe-area padding) must be applied 9 times.

**Fix:** Extract a <BottomSheet> primitive (Modal + backdrop + grabbed card + Cancel) and a data-driven <ActionSheet items={[{icon,label,onPress,destructive?}]}> built on it. Rewrite WorkoutActionSheet/MovementActionSheet/GroupActionSheet and the inline SetActionModal as ~10-line configs, and reuse BottomSheet in EditSetSheet/AddMovementSheet/FilterPicker/settings modals.

### 36. Theme palette defined twice in two parallel systems (ThemeProvider CSS vars vs useThemeColors JS object) that must be hand-synced
`refactoring` · area **mobile/shared** · not independently verified · reviewer confidence: high

**Where:** `apps/mobile/hooks/useThemeColors.ts` (useThemeColors.ts Colors object 8-46; ThemeProvider.tsx lightTheme/darkTheme vars 27-45)

**What / why:** Theme is spread across four units: ThemeProvider (context + AsyncStorage + nativewind vars), useTheme (re-export of the context), ThemeSelector (reconciles context theme vs userProfile.theme), and useThemeColors — which does NOT consume ThemeContext but re-reads nativewind's useColorScheme() and returns a hand-written JS Colors map. The dark/light palette is therefore duplicated: ThemeProvider sets --color-card:'30 41 59' / --color-border:'51 65 85' for className-styled surfaces, while useThemeColors independently sets card: slate[800] / border: slate[700] for inline styles and icon color props. Failure scenario: a designer changes the dark card color in ThemeProvider's darkTheme vars; NativeWind bg-card surfaces update but every icon and inline style fed from useThemeColors.card stays the old shade, so a screen mixing className and colors.* renders two different 'card' colors.

**Fix:** Define the palette once (a shared tokens module) and derive both the NativeWind vars() maps and the useThemeColors object from it, and have useThemeColors read colorScheme from useThemeContext() rather than opening a second nativewind subscription. This collapses the two sources of truth and removes drift between className-styled and inline/icon-styled surfaces.


---

## ⚪ LOW severity

### 37. Auth gating uses getSession() (unverified) rather than getUser()
`security` · area **web/shared** · not independently verified · reviewer confidence: medium

**Where:** `packages/shared/src/lib/auth/AuthProvider.tsx` (47 (supabase.auth.getSession) and apps/web/src/lib/auth/AuthProvider.tsx:47)

**What / why:** AuthProvider (both the shared copy and the web copy) derives `user` from supabase.auth.getSession(), whose contents come from local storage and are not re-validated against the auth server; the reset-password page does the same. ProtectedRoute then gates UI on this unverified user. This is the pattern Supabase's own linter warns about. It is only low severity here because the client-side gate is cosmetic — the actual data boundary is RLS, which validates the JWT server-side on every request — so a forged local session buys an attacker a rendered shell with no data. Worth noting so the getSession() result is never promoted into a real trust decision (e.g. a future server path).

**Fix:** For any decision beyond rendering a shell, use supabase.auth.getUser() (which round-trips to the auth server). Keep getSession() only for optimistic UI. Consolidate the duplicated AuthProvider so the fix applies once.

### 38. SECURITY DEFINER functions (incl. trigger-only handle_new_user) are EXECUTE-able by anon/authenticated via /rest/v1/rpc
`security` · area **db/mobile** · not independently verified · reviewer confidence: high

**Where:** `live DB grants (get_home_stats, handle_new_user, update_movement_last_sets, update_workout_movement_counts)` (function EXECUTE grants to anon/authenticated)

**What / why:** Four SECURITY DEFINER functions are callable over PostgREST RPC. handle_new_user, update_movement_last_sets and update_workout_movement_counts are trigger functions (RETURNS trigger); calling them directly via RPC raises Postgres error 0A000 'trigger functions can only be called as triggers' because NEW/TG_OP are unset, so there is no direct data impact today. get_home_stats is invocable but self-scopes to auth.uid() (anon → auth.uid() null → zeros). Impact is limited to unnecessary attack surface, not a working exploit.

**Fix:** REVOKE EXECUTE ON FUNCTION public.handle_new_user(), public.update_movement_last_sets(), public.update_workout_movement_counts() FROM anon, authenticated (they only ever run as triggers). Keep get_home_stats granted to authenticated only (REVOKE from anon).

### 39. Deep-link handler creates a session from link-supplied access/refresh tokens (session fixation)
`security` · area **db/mobile** · not independently verified · reviewer confidence: medium

**Where:** `apps/mobile/hooks/useDeepLink.ts` (83-94, 108-117, 130-142 (setSession from access_token/refresh_token))

**What / why:** processAuthLink accepts a `logset://` deep link and, on several branches including the unknown-type fallback, calls supabase.auth.setSession({access_token, refresh_token}) using tokens taken directly from the URL fragment. Custom URL schemes are not owner-exclusive on Android, and a crafted link can be delivered to the victim. Failure scenario: an attacker crafts a link containing the attacker's own tokens; if the victim opens it, the app silently logs the victim into the attacker's account (login CSRF / session fixation), and workouts the victim then logs land in the attacker's account for later retrieval. The token_hash + verifyOtp branches are server-validated and fine; only the raw-token setSession paths carry this risk.

**Fix:** Prefer the token_hash + verifyOtp (PKCE) flow for all auth deep links and drop the raw access_token/refresh_token setSession fallback, or gate it behind explicit user confirmation. Restrict handled types to the exact expected set and reject links whose `type` is unknown.

### 40. workout_groups RLS uses bare auth.uid() (per-row re-eval) and personal_records.set_id FK is unindexed
`security` · area **db/mobile** · not independently verified · reviewer confidence: high

**Where:** `supabase/migrations/20251223000000_add_workout_groups.sql` (policies lines 16-33 (auth.uid() = user_id); + live personal_records_set_id_fkey)

**What / why:** All four workout_groups policies use bare `auth.uid() = user_id` rather than `(select auth.uid()) = user_id`, so the function is re-evaluated per candidate row instead of once per query — a measurable cost on larger scans (the newer sets policies already use the (select auth.uid()) form, confirming the fix pattern). Separately, personal_records_set_id_fkey has no covering index, so deletes/updates on the referenced parent and set_id lookups do sequential scans of personal_records. Both are performance-only.

**Fix:** Recreate the workout_groups policies with `(select auth.uid())` in every USING/WITH CHECK. Add `create index personal_records_set_id_idx on public.personal_records(set_id);`. Also review the ~30 advisor-reported unused indexes and drop the ones that are not for anticipated queries to cut write amplification.

### 41. Auth hardening gaps: leaked-password protection disabled and Postgres has outstanding security patches
`security` · area **db/mobile** · not independently verified · reviewer confidence: high

**Where:** `Supabase project config (pvfimysvoikizuemevez)` (Auth settings; Postgres version)

**What / why:** Leaked-password protection (HaveIBeenPwned check) is disabled, so users can set known-compromised passwords, increasing credential-stuffing/account-takeover risk on this password-based auth app. The Postgres instance is also behind on security patches per the platform advisor. Neither is code-level but both are live security posture items owned by this area.

**Fix:** Enable leaked-password protection in Supabase Auth settings (Authentication > Providers/Policies), consider raising minimum password strength, and schedule the Postgres upgrade from the project's Infrastructure settings.

### 42. get_home_stats groups workout sessions by UTC day, splitting/merging late-night sessions for non-UTC users
`correctness` · area **shared** · not independently verified · reviewer confidence: medium

**Where:** `supabase/migrations/20251230160000_add_home_stats_function.sql` (58)

**What / why:** recent_activity groups sets by date_trunc('day', s.created_at) with created_at being a timestamptz truncated in UTC (no AT TIME ZONE conversion). Failure scenario: a user in UTC-8 trains 9pm-10pm local (05:00-06:00 UTC next day) — that single session is bucketed to the UTC calendar day and can be split from, or merged with, an earlier same-local-day session, so the dashboard's session_volume and exercise_count for a session can be wrong and last_activity_date can show the following calendar day. Weekly_volume is a rolling 7-day window so it is unaffected; only the session grouping is.

**Fix:** If sessions should align to the user's local day, store/pass a timezone and group by date_trunc('day', s.created_at AT TIME ZONE user_tz); otherwise document that sessions are UTC-day-bucketed.

### 43. Add-movements page resets in-progress selection whenever workoutMovements query data changes
`correctness` · area **web** · not independently verified · reviewer confidence: medium

**Where:** `apps/web/src/app/workout/[workoutId]/movements/page.tsx` (96-101)

**What / why:** The useEffect that seeds selectedMovements/initialSelectedMovements depends on `workoutMovements` and unconditionally calls setSelectedMovements(new Set(...)) every time that reference changes. useWorkoutMovements has no staleTime (default 0) and refetchOnWindowFocus is on, so if the underlying workout_movements data actually changes while the user is mid-edit (e.g., the movement set was modified in another tab, or an optimistic update elsewhere alters the cache), the effect fires and discards the user's not-yet-saved selections/deselections. React Query structural sharing masks this for identical refetches (same reference → effect skipped), so it is intermittent rather than constant, hence low severity.

**Fix:** Seed selection only once (e.g., guard with a `hasInitialized` ref, or key the effect on workoutId/initial load state) so later background refetches update `initialSelectedMovements` for diffing without clobbering the user's live `selectedMovements`.

### 44. Confirm screen success state is dead code; timeout comment says 5s but is 10s
`correctness` · area **mobile** · not independently verified · reviewer confidence: medium

**Where:** `apps/mobile/app/confirm.tsx` (useEffect ~L28-38)

**What / why:** ConfirmEmailScreen never calls setState with status 'success' (verification/navigation is done by useDeepLink, which router.replace('/')s away on success), so the CheckCircle/'Email Verified!'/'Continue to App' branch can never render. Separately the inline comment says 'If we're still here after 5 seconds' but the setTimeout is 10000ms. Harmless but misleading; if a deep link is slow or never matched the user sees a spinner for 10s then a generic timeout error.

**Fix:** Either drive confirm.tsx's status from useDeepLink's isProcessing/error/success (surface a success signal) so the success UI is reachable, or delete the unreachable success branch; fix the comment to match 10000ms.

### 45. useSetsCountByMovement over-fetches all rows/columns to count and collides with useSetsByMovement's key
`optimization` · area **web/shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/hooks/useSets.ts` (81-104)

**What / why:** useSetsCountByMovement does `.select('*', { count: 'exact' })` then returns `data?.length || 0` — it downloads every column of every set row for the movement just to count them client-side, and discards the exact count PostgREST already computed. Separately, it uses the identical query key setKeys.byMovement(userId, movementId) as useSetsByMovement (line 118) while returning a number instead of SetWithMovement[]; if both hooks ever mount for the same movement they share one cache entry with incompatible shapes. Currently only useSetsByMovement is consumed in the web app (MovementDetail), so the collision is latent, but the over-fetch is real wherever the count hook is used (mobile).

**Fix:** Use `.select('*', { count: 'exact', head: true })` and return the `count` value (no rows transferred), and give the count query a distinct key (e.g. setKeys.countByMovement) to avoid the shape collision with useSetsByMovement.

### 46. useMovementLastSets mutates the caller's movementIds array via .sort() inside the query key
`optimization` · area **web/shared** · not independently verified · reviewer confidence: medium

**Where:** `packages/shared/src/hooks/useMovementLastSets.ts` (23)

**What / why:** queryKey: ['movement-last-sets', user?.id, movementIds.sort()] calls Array.prototype.sort() which sorts the passed-in array in place and returns the same reference. If a caller passes a memoized array (e.g. derived via useMemo of workout movement ids), this reorders that array as a side effect of rendering, which can surprise other consumers relying on its order and does not actually stabilize the key across renders that rebuild the array. Failure scenario: a component memoizes movementIds in a specific display order and also feeds it to this hook; the hook silently re-sorts the shared array, changing render order elsewhere.

**Fix:** Copy before sorting: `[...movementIds].sort()`.

### 47. workout_groups RLS policies use bare auth.uid() (per-row re-evaluation)
`optimization` · area **mobile/db** · not independently verified · reviewer confidence: high

**Where:** `database: public.workout_groups RLS policies` (4 policies (select/insert/update/delete))

**What / why:** All four workout_groups policies use `auth.uid() = user_id` rather than `(select auth.uid()) = user_id`. Without the scalar subquery wrapper, auth.uid() is re-evaluated per candidate row instead of once per query (Postgres init-plan optimization). workout_groups is tiny so the real-world cost is negligible now, but it is inconsistent with the rest of the schema and the fix is free.

**Fix:** Recreate each policy replacing auth.uid() with (select auth.uid()), e.g. `USING ((select auth.uid()) = user_id)` and the INSERT `WITH CHECK ((select auth.uid()) = user_id)`.

### 48. Two redundant single-column indexes on the hot sets table; ~30 'unused' indexes are mostly a small-data artifact
`optimization` · area **mobile/db** · not independently verified · reviewer confidence: medium

**Where:** `database: public.sets indexes` (idx_sets_user_id, idx_sets_user_movement_id)

**What / why:** On sets, idx_sets_user_id (user_id) is fully prefix-covered by idx_sets_created_at (user_id, created_at DESC), and idx_sets_user_movement_id (user_movement_id) is prefix-covered by idx_sets_movement_date (user_movement_id, created_at DESC). Both single-column indexes are redundant at any scale and add write amplification on the most frequently-inserted table. Separately, the advisor's ~30 'unused' indexes should NOT be blanket-dropped: sets=81 rows and every other user table is 0-104 rows, so idx_scan=0 mostly reflects the planner choosing seq scans on near-empty tables, plus several are write-side FK/uniqueness supports (e.g. workouts_group_id_idx, personal_records composites) that will be needed as data grows. The genuinely-covered common path 'sets by user_movement_id + created_at' is already served (idx_sets_movement_date, 65 scans) and needs no new index.

**Fix:** DROP INDEX idx_sets_user_id; DROP INDEX idx_sets_user_movement_id; (composites already serve their predicates). Leave the other flagged indexes in place and re-run the unused-index advisor once real data volume exists rather than dropping now.

### 49. Dead shared createClient couples React Native AsyncStorage into the shared package
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/lib/supabase/client.ts` (1)

**What / why:** This is the third createClient() implementation. Unlike the two live, legitimately platform-specific clients (apps/web caches a singleton browser client; apps/mobile wires AsyncStorage), the shared one does runtime env-var sniffing to branch web-vs-mobile and unconditionally `import AsyncStorage from "@react-native-async-storage/async-storage"` at module top. It is not exported from packages/shared/index.ts and has zero importers. Failure scenario: if anyone follows the apparent intent and imports this from the web app, it pulls the React Native AsyncStorage module into the Next.js bundle (bundle bloat / potential build break), and returns a non-singleton client that reconnects on every call — a regression versus the web singleton.

**Fix:** Delete packages/shared/src/lib/supabase/client.ts. Keep the two platform clients as the intended seam (the DI hooks already receive `supabase` as a dependency, so shared needs no client of its own).

### 50. packages/ui is a phantom package: exports point to files that do not exist
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: high

**Where:** `packages/ui/package.json` (5-9)

**What / why:** packages/ui contains only package.json + eslint config; there are no source files. Yet its package.json declares `"main": "./index.ts"`, `"types": "./index.ts"` and `"exports": { ".": "./index.ts", "./globals.css": "./src/globals.css" }` — all pointing at nonexistent files — and pins `react: ^18.2.0` while the rest of the monorepo is React 19. No workspace package depends on @fitness/ui. Failure scenario: the first `import { X } from "@fitness/ui"` (or import of its globals.css) fails module resolution / type-check, and the React 18 pin risks pulling a second React version into an app that adds the dep.

**Fix:** Either remove packages/ui from the pnpm workspace entirely (nothing depends on it), or scaffold the referenced index.ts/src/globals.css and align react to ^19. Given packages/ui was flagged empty, removal is the higher-payoff option.

### 51. Root directory cluttered with 9 status-report .md docs and 145KB of committed crash logs
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: medium

**Where:** `/ (repo root): DASHBOARD_CACHE_FIX.md, OPTIMIZATION_SUMMARY.md, PERFORMANCE_AUDIT_PLAN.md, PERFORMANCE_FIX_SUMMARY.md, PERFORMANCE_ISSUE_ANALYSIS.md, QUERY_INVALIDATION_OPTIMIZATION.md, WORKOUT_ARCHIVE_FEATURE.md, WORKOUT_NOTES_IMPLEMENTATION_COMPLETE.md, cold_start_crash.txt, full_crash_log.txt` (n/a)

**What / why:** The monorepo root holds nine point-in-time status/summary markdown docs (dated Sep-Dec 2025) plus two large raw crash logs (cold_start_crash.txt 85KB, full_crash_log.txt 59KB). These are transient work artifacts, not living documentation, and they dominate the root listing above the actual project files, obscuring README.md and the real config. Failure scenario: contributors treat stale 'IMPLEMENTATION_COMPLETE'/'OPTIMIZATION_SUMMARY' notes as current architecture docs and act on outdated guidance.

**Fix:** Move the historical status docs into a docs/history/ folder (or delete once superseded), and remove the committed crash logs (add *.txt crash dumps to .gitignore). Keep only README.md and genuinely current setup docs at root.

### 52. Oversized apps/web route/component files past ~450 lines warrant decomposition
`refactoring` · area **monorepo** · not independently verified · reviewer confidence: medium

**Where:** `apps/web/src/app/workout/[workoutId]/movement/[movementId]/settings/page.tsx (495); apps/web/src/components/common/SetEntryForm.tsx (453); apps/web/src/components/common/SessionComparison.tsx (446); apps/web/src/app/library/movement/[movementId]/settings/page.tsx (443)` (n/a)

**What / why:** Setting aside the duplicated useMovements files, the largest hand-written apps/web sources are two near-identical movement 'settings' route pages (495 and 443 lines) plus SetEntryForm (453) and SessionComparison (446). The two settings pages in particular are strong candidates for a shared MovementSettingsForm component — one drives the library route, the other the in-workout route, and they largely configure the same fields. Failure scenario: a validation or field change to movement settings must be duplicated across both 495/443-line pages and drifts (the same class of bug already seen in useMovements).

**Fix:** Extract a shared MovementSettingsForm component consumed by both settings pages; split SetEntryForm into presentational input rows + a container hook; split SessionComparison's per-metric rendering into a subcomponent. Prioritize the two settings pages (highest overlap).

### 53. Oversized mobile screens mixing data orchestration, inline sub-components, and layout (movement detail 651, workout detail 519, settings 417 lines)
`refactoring` · area **mobile/shared** · not independently verified · reviewer confidence: medium

**Where:** `apps/mobile/app/workout/[id]/movement/[movementId]/index.tsx` (1-651 (SetActionModal inline at 52-120; MovementDetailScreen 121-651))

**What / why:** MovementDetailScreen holds ~14 useState/useMemo/handlers, an inline SetActionModal action sheet, a custom Stack header renderer (line 309), and an inline per-date set list renderer (line 491) in one 651-line file. workout/[id]/index.tsx (519), movement/[movementId]/settings.tsx (506), and (tabs)/settings.tsx (417) follow the same pattern. Failure scenario: this size makes the file hard to change safely — e.g. the inline SetActionModal is a 4th copy of the action-sheet scaffold that no one dedupes precisely because it is buried inside a screen, and the inline set-list JSX can't be memoized or unit-tested independently.

**Fix:** Lift SetActionModal into components/ (or fold into the shared ActionSheet from the finding above), extract the date-grouped set list into a <MovementSetHistory> component and the header into <MovementDetailHeader>, and move the set create/duplicate/delete orchestration into a useMovementDetail() hook. Target screen files under ~250 lines that read as composition.

### 54. packages/shared/src/lib/supabase/client.ts is a platform-conflated module that top-level-imports React Native AsyncStorage into the shared package
`refactoring` · area **mobile/shared** · not independently verified · reviewer confidence: high

**Where:** `packages/shared/src/lib/supabase/client.ts` (1-30)

**What / why:** This module imports '@react-native-async-storage/async-storage' at the top level and branches at runtime on NEXT_PUBLIC_SUPABASE_URL (web) vs EXPO_PUBLIC_SUPABASE_URL (mobile). That defeats the whole HookDependencies injection design (the reason shared hooks take a supabase client as a parameter is precisely so shared never picks a platform). It also means any web bundle that imported this file would pull a native-only dependency. It is currently unexported/unused (mobile's AuthProvider imports its own ../supabase/client), so it is dead conflated code — but it models the exact boundary violation the DI pattern exists to prevent, and shared's package.json simultaneously carries web-only deps (@supabase/ssr, lucide-react).

**Fix:** Delete shared/src/lib/supabase/client.ts. Keep client construction in each app (apps/mobile/lib/supabase/client.ts, apps/web/src/lib/supabase/client.ts) and pass the instance in via HookDependencies, which is already how every wired shared hook consumes it. Drop React-Native and Next-only packages from shared's dependencies so the boundary is enforced by the dependency graph.
