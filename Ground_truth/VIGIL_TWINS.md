# VIGIL Twins

> The Twins are not optional.
> They balance the flow so there is no weak link.

## Purpose

The Core Twins are the balance and verification layer of the VIGIL architecture. They sit between the Pillars and the Mirrors, ensuring system integrity in both directions.

## What Twins Verify

- **Downward structure** — Doctrine flows correctly through Core → Axiom → Pillars → Mirrors
- **Upward Intel** — Results returned from Mirrors are properly identity-scrambled and verified
- **Mirror interpretation balance** — No single Mirror drifts from Doctrine
- **System stability** — The overall architecture maintains coherence

## Architectural Position

```
Pillars
   │
   ▼
TWINS ← Balance layer
   │
   ▼
Mirrors
```

## Rules

- Twins must **never** be omitted from any implementation
- Twins are not passive — they actively verify both directions of flow
- Without Twins, there is a **weak link** in the architecture
- Twins do not generate content — they verify and balance

## Implementation Status

> ✅ **IMPLEMENTED** in `convex/twins.ts`
>
> - **Twin Alpha** (downward): Deterministic verification of Mirror responses against
>   forbidden patterns, cognitive state band alignment, and presence requirements.
>   AI-powered deep verification available via `deepVerify` action.
> - **Twin Beta** (upward): Identity scrambling (callsign, name, email, phone, SSN,
>   address removal) and Intel verification for Doctrine preservation.
> - Verification results recorded in `twinVerifications` table with full audit trail.
> - Mirror `doctrineCompliance` score degrades on failed verifications.
> - System health monitoring via `getSystemHealth` query.
