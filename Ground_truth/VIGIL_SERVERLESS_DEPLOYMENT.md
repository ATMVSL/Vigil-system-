# VIGIL Serverless Deployment

> Multi-platform deployment targets.

## Deployment Targets

VIGIL must be deployable across:

1. **Serverless web deployment** — Primary production target
2. **Laptop/local base of operations** — Development and personal use
3. **Windows + Ubuntu dual setup** — Local sovereignty
4. **Termux mobile base** — Mobile access
5. **Future VIGIL core and mirror expansions**

## Current Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 19, Tailwind v4, shadcn/ui | ✅ Implemented |
| Backend | Convex (real-time database + serverless functions) | ✅ Implemented |
| AI | OpenAI GPT-5.4 (chat, grading, assessment) | ✅ Implemented |
| Voice | OpenAI Whisper (STT), OpenAI TTS | ✅ Implemented |
| Auth | Email/OTP via Convex Auth | ✅ Implemented |
| Hosting | Vercel (frontend), Convex Cloud (backend) | ✅ Configured |

## Deployment Rules

- Sovereign deployment — user data stays under user control
- No centralized convenience at the cost of sovereignty
- Builder must generate deploy packages for all target platforms
- Each deployment preserves the full architecture — no simplified "lite" versions
