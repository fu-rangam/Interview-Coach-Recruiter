# Decision Log

## ADR-001: Persistence Strategy for Public Candidates

### Context
Candidates access the application via a public link (Anonymous users).
However, they need to update `sessions`, `answers`, and `eval_results`.
Supabase RLS on `public` table `sessions` usually requires an authenticated user (`auth.uid()`) to match a `recruiter_id` or similar owner.
We attempted to solve this with standard RLS but ran into "New Row Violates Policy" issues because the Candidate is not the Owner.

### Decision
We use a **Repository Pattern** backed by a **Service Role Client (Admin)** for all candidate-driven write operations.
- File: `src/lib/server/infrastructure/supabase-session-repository.ts`
- Client: `createAdminClient()` (uses `SUPABASE_SERVICE_ROLE_KEY`)

### Consequences
- **Security Check**: The Repository MUST validate the Candidate Token (via `InviteRepository` logic or implicit Session ID knowledge) before performing updates. We currently rely on the fact that the Candidate possesses the valid `session_id` (UUIDv7) and `token`, but stricter checks should be implemented in `route.ts`.
- **Environment**: `SUPABASE_SERVICE_ROLE_KEY` is required in `.env.local`.

## ADR-002: Draft Persistence (Auto-Save)

### Context
Users may lose text input if they refresh or navigate away.

### Decision
We implement an **Optimistic UI + Debounced API** pattern for all long-form text inputs.
- **Frontend**: Local state updates immediately. A `useEffect` debounces changes (e.g. 1000ms) and calls `onSaveDraft`.
- **API**: A dedicated (or shared) endpoint updates the specific field (e.g. `transcript`) without requiring a full session submission.
- **Feedback**: UI displays "Saving..." -> "Saved" to build trust.

## ADR-003: Engagement Tracking Logic Harmonization

### Context
Engagement tracking defines user tiers (1-3) to manage the engagement "window". Previously, Tier 2 was extension-only and Tier 3 was 30s, causing data loss when users were active but the window was closed, and resets when navigating questions.

### Decision
Harmonize logic to prioritize user activity:
- **Tier 2 (Interactions)**: Both **Opens and Extends** the window (30s).
- **Tier 3 (Task Events)**: Defaults to **60s** duration.
- **Time Persistence**: `useEngagementTracker` now handles state synchronization and mandatory flushes:
  - **Sync to Prop**: Local `totalEngagedSeconds` synced with `initialSeconds` prop when it increases (re-syncing after server updates/refreshes).
  - **Flush on Transition**: `flushEngagement()` is called before `next()`, `retry()`, and `submit()` to ensure all sub-10s accumulations are persisted before navigating.

### Consequences
- More consistent tracking for non-voice (Text) modes.
- Robust time preservation across question transitions and page refreshes.
- Cumulative session time is accurately reflected in the UI and persisted.
