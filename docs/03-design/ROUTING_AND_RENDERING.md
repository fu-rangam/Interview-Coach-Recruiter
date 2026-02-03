# ROUTING_AND_RENDERING.md

Purpose: Define the hard boundary between Pages and Screens so routing stays simple, UI stays state-driven, and “just one little router hack” never becomes your app’s personality.

---

## Core definitions

### Page
A Page is a route entry point. It is responsible for:
- reading URL params / query strings
- validating or normalizing route inputs (e.g., invite_token)
- initiating data/session bootstrap (if needed)
- selecting which Screen to render

A Page is allowed to:
- use router hooks (react-router, wouter, etc.)
- read `window.location`
- handle redirects / guard routes
- own error boundaries for route-level failures

A Page is not allowed to:
- implement session UI details
- contain business logic beyond orchestration
- encode session progress in the URL (e.g., /q/3)

---

### Screen
A Screen is a state-driven UI surface. It is responsible for:
- rendering the UI for one coherent session state
- calling actions (submit, retry, exit) via the Session API/context
- composing session components and UI primitives

A Screen is allowed to:
- read derived session state (e.g., `now`, selectors)
- call actions (e.g., `actions.submitAnswer()`)
- open UI overlays (Dialog/Popover/Sheet)
- be pure with respect to routing (no router knowledge)

A Screen is not allowed to:
- use router hooks
- read or mutate URL params
- perform redirects
- fetch session bootstrap data directly (unless explicitly delegated and documented)
- decide “where to go next” via navigation (state transitions decide)

---

## The rule of flow

Routing chooses Pages.  
Pages choose Screens.  
Screens never choose Pages.

---

## Rendering algorithm (canonical)

The app renders Screens based on **derived session state**, not URL shape.

High-level algorithm:

1) Page reads route inputs (invite_token, optional debug params)
2) Page initializes/loads session context (or triggers load)
3) Page computes derived “now” state using selectors
4) Page selects Screen based on now state
5) Screen renders UI + triggers state transitions via actions

---

## File and folder conventions (Vite React)

Recommended structure:

src/
  pages/
    InterviewSessionPage.tsx
  screens/
    session/
      InitialsScreen.tsx
      LandingScreen.tsx
      ActiveQuestionScreen.tsx
      PendingEvaluationScreen.tsx
      ReviewFeedbackScreen.tsx
      SummaryScreen.tsx
  components/
    session/              # composed session UI pieces
    ui/                   # primitives (Button, Card, etc.)
  lib/
    core/                 # domain, state, adapter logic
    cn.ts

Naming rule:
- Pages end with `Page.tsx`
- Screens end with `Screen.tsx`

---

## Route contract: Interview Session

Example route:

/s/:invite_token

Page responsibilities:
- parse invite_token
- validate presence/shape (basic)
- start session load if needed
- render session shell and selected screen

Screen responsibilities:
- never reference invite_token
- never read path
- render based only on now state + actions

---

## Screen selection (example mapping)

Use a selector (or small mapping) inside the Page:

- If session not loaded:
  - render loading skeleton or PendingEvaluationScreen (depending on state model)
- If initials required:
  - render InitialsScreen
- If initials collected but not started:
  - render LandingScreen
- If answering:
  - render ActiveQuestionScreen
- If awaiting eval:
  - render PendingEvaluationScreen
- If feedback ready / review step:
  - render ReviewFeedbackScreen
- If complete:
  - render SummaryScreen

Important: This mapping is driven by state (e.g., `now.screen`, `now.status`), not by the URL.

---

## URL policy (hard rules)

Allowed:
- /s/:invite_token
- optional query params for diagnostics (dev only), e.g. ?debug=1

Not allowed:
- /s/:invite_token/q/:questionIndex
- /s/:invite_token/screen/:screenId
- any URL encoding of progress, retries, attempts, or evaluation state

Reason:
- refresh/resume is guaranteed by persisted state, not by reconstructing state from the URL.

---

## Refresh and resume behavior

Invariant:
- Re-opening / refreshing the invite link should always restore the candidate to the correct in-progress UI state.

Mechanism:
- Session state is persisted (autosave drafts, submitted answers, attempt history)
- On load, state is rehydrated
- Derived state (“now”) selects the correct Screen
- Page remains static; Screen changes as state changes

---

## Anti-patterns (explicitly forbidden)

- Router hooks inside Screens
- Screens that call navigation (push/replace) to advance flow
- Encoding progress in the URL
- Duplicating screen selection logic across multiple pages
- “Page components” that include large UI blocks for session experience

If you catch any of these in review, treat it as a bug.

---

## Practical examples

### Good: Page selects screen

InterviewSessionPage:
- parse token
- bootstrap session
- select screen: `const screen = selectScreen(now)`
- `return <ScreenComponent />`

### Good: Screen triggers state transitions

ActiveQuestionScreen:
- render question + response composer
- call `actions.submitAnswer(...)`
- after submit, UI updates via state → Page picks new Screen

### Bad: Screen navigates

ActiveQuestionScreen:
- calls `navigate('/q/4')` to go forward
This violates the model and will break resume/rehydration.

---

## Acceptance criteria

This doc is “implemented” when:

- Screens compile without importing router libraries
- Pages contain minimal UI (mostly orchestration)
- Refreshing the invite link returns candidate to the correct state
- Session progression never changes the URL
- State transitions alone determine what the user sees

---
