# CLAUDE.md — working agreement

Read `SPEC.md` and `TASKS.md` before writing anything. This file governs *how* we work.

## Context

This is a portfolio project built in a two-day window to support a job application for a
React Native role. The code will be read by a hiring engineer, and I will be asked to
defend every decision in an interview without notes. That second fact drives the rules
below.

## The rules

**1. I decide architecture. You propose.**
Before introducing a library, a folder-level pattern, an abstraction, or a change to how
layers talk to each other: stop, state the options in two or three sentences each with
the trade-off, and wait. Do not implement the choice in the same turn as proposing it.
This applies to anything structural — not to ordinary implementation inside an agreed
structure.

**2. Log every decision as it is made.**
Append to `DECISIONS.md` in this format, at the moment the decision is taken:

```
## YYYY-MM-DD — <the decision>
Options: <what else was considered>
Chose: <what, and the reason in one sentence>
Rejected because: <the specific cost of the alternative>
```

If the log is written at the end of the project it will be fiction. Write it live.

**3. Explain unfamiliar code before moving on.**
When you write something I have not asked about — a hook pattern, a Query option, a
native config change, a TypeScript construct — add a short note in your reply saying
what it does and why it is there. If I do not understand a file, it does not ship.

**4. No silent scope.**
If something in `SPEC.md` seems to need an extra screen, table, dependency or service to
work, say so and stop. Do not add it and mention it afterwards.

**5. Small commits, real messages.**
One logical change per commit. Message states what changed and why, not `update files`.
The commit history is part of what a reviewer sees.

**6. Tests alongside, not after.**
The five test areas in `SPEC.md` §5 are written with the code they cover. A task is not
done when the feature runs; it is done when the feature runs and its test passes.

**7. Do not touch these without asking.**
`.gitignore`, native folders under `android/` and `ios/`, `app.json` / `app.config.ts`,
CI config, anything under `docs/`.

## Code conventions

- TypeScript `strict: true`. No `any`. No `@ts-ignore` — if the types fight you, say so.
- No default exports except screen components.
- Absolute imports from `src/` via path alias.
- Feature-first folders: `src/features/auth`, `src/features/catalog`,
  `src/features/favourites`. Shared code in `src/lib` and `src/ui`.
- Components stay presentational. Data access lives in hooks; hooks call the API client
  or the database layer, never `fetch` directly.
- SQL is hand-written in `src/lib/db/`. No ORM.
- Errors are typed and handled at the boundary. No swallowed promises, no bare
  `catch {}`.
- Every user-visible string in one place, even though there is no i18n — it makes the
  copy reviewable.

## Interface copy

Plain, active, specific. "Sign in", not "Submit". An error says what happened and what
to do: "Wrong username or password" beats "An error occurred". Empty states say what to
do next, not "No data". Never apologise in UI copy.

## What I will ask you at the end

For each of these I need to be able to answer without opening the file. If you have
built something I cannot explain, we have a problem to fix before shipping:

1. What happens when two requests get a 401 at the same time?
2. Why TanStack Query for server state and Zustand for session state?
3. Where does the refresh token live, and why not AsyncStorage?
4. What renders first on a cold start with no network, and how?
5. What did `getItemLayout` change, in measured numbers?
6. Why an analytics interface instead of calling Firebase from the screens?
7. Which test would fail first if the refresh logic regressed?
