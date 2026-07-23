# VIGIL Learning Engine

> VIGIL improves without drift or hallucination.

## The Exact Learning Model

- VIGIL improves through **live interaction**
- Mirrors improve through **verified Intel**
- Verified Intel is **scrambled for user identity protection**
- Results are **proven and tested** before being applied
- **No cross-user bleed** — one user's patterns never affect another's Mirror
- **No one-size-fits-all collapse** — improvements must preserve individual sovereignty
- **Doctrine is never rewritten** — learning happens within Doctrine constraints
- VIGIL improves **without drift or hallucination**

## How Learning Flows

```
User interacts with Mirror
       │
       ▼
1. CAPTURE: Mirror captures patterns (reflections, cognitive states)
       │
       ▼
2. SCRAMBLE: Patterns are identity-scrambled & PII stripped
       │
       ▼
3. VERIFY: Scrambled patterns are verified (statistical & human sign-off)
       │
       ▼
4. APPLY: Verified patterns improve personal Mirror (per-user sovereignty)
       │
       ✗ Doctrine remains unchanged
       ✗ No user can be identified
       ✗ No cross-user contamination
```

## Baseline Establishment & Drift Monitoring

After 3+ reflections, a Mirror's baseline is established (`detectDrift` API):

- Represents the user's normal cognitive state
- Enables drift detection (% deviation from baseline)
- Triggers Anchor Recall if drift exceeds critical thresholds
- Is sovereign to the user — never shared

## Implementation Status

> **FULL IMPLEMENTATION COMPLETE** — The complete 4-stage Learning Engine pipeline (`capture` → `scramble` → `verify` → `apply`) is implemented in `convex/learningEngine.ts`.

### Backend API Endpoints (`convex/learningEngine.ts`)
- `getLearningPipelineStatus`: Retrieves baseline status and reflection count.
- `captureInteraction`: Stage 1 — Captures interaction and checks 3+ reflection baseline.
- `scramblePattern`: Stage 2 — Strips PII and creates non-reversible pattern hash.
- `verifyPattern`: Stage 3 — Conducts verification & enforces zero-doctrine-rewrite rule.
- `applyPattern`: Stage 4 — Applies improvement strictly to operator's own Mirror.
- `detectDrift`: Monitors drift score against user baseline.
