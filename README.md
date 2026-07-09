# VIGIL — Veteran Identity Garrison for Intentional Living

**VIGIL Academy** is a proprietary training and cognitive engagement platform built on the SELF Doctrine framework. It provides structured learning, real-time AI-powered mentoring, and progressive certification for veterans and operators.

> *"Knowledge flows down, never up."* — Cardinal Axiom

---

## 🛡️ Core Systems

### Continuity Anchor Mirror™
A real-time cognitive engagement system — not therapy, not a chatbot, but a **constant presence**. The Mirror operates through:
- **4 Cognitive State Bands**: Stable → Reinforce, Strain → Stabilise, Drift → Interrupt, Critical → Anchor Recall
- **Self-Filling Waterfall Architecture**: Doctrine Engine → State-Band Logic → User Baseline → Expressive Model
- **13-Stage Cognitive Loop Pipeline**: From entry through cardinal axiom guard, drift detection, pattern recognition, to doctrine-constrained response
- **Real-time voice interaction**: VAD auto-pause detection, streaming responses, sentence-level TTS

### SELF Doctrine — Six Pillars
| Pillar | Service Member | Mission |
|--------|---------------|---------|
| **S**tructure | SPC Gonzales | Foundation and order |
| **E**ndurance | SPC Hargis | Sustained resilience |
| **L**egacy | SPC Shaw | Purpose beyond self |
| **F**ortitude | SGT Stampley | Strength under pressure |
| Continuity | SPC Luna | Unbroken identity chain |
| Presence | SGT Walker | Grounded awareness |

### Five Immutable Axioms
1. **Sovereignty** — The user's identity is inviolable
2. **No Probing** — The system never extracts; it reflects
3. **No Override** — Doctrine cannot be overridden by user input
4. **Continuity** — Every session connects to the last
5. **Cardinal** — Knowledge flows down, never up

---

## 📚 Academy Modules

- **SELF Doctrine Foundations** — 12 lessons on identity architecture
- **Continuity Anchor Mirror™ Operations** — 8 lessons on Mirror engagement
- **Cognitive Loop Pipeline** — 13 lessons on the 13-stage processing pipeline
- **SQL Training Lab** — 15 lessons with AI-graded query challenges
- **Infrastructure Administration** — 10 lessons on system deployment
- **VIGIL Operator Certification** — 20 lessons culminating in certification

**78 total lessons** with assessments, simulations, and practical exercises.

---

## 🔐 Role-Based Access

```
Operator → Certified → Admin → Superadmin → Founder
```

- New users start as **Operator** (pending Founder approval)
- Progression through course completion and certification
- **Founder** has absolute system authority
- Role assignments managed exclusively through the Founder Mirror

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind v4, shadcn/ui |
| Backend | Convex (real-time database + serverless functions) |
| AI | OpenAI GPT-5.4 (chat, grading, assessment) |
| Voice | OpenAI Whisper (STT), OpenAI TTS (text-to-speech) |
| Auth | Email/OTP via Convex Auth |
| Hosting | Vercel (frontend), Convex Cloud (backend) |

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- Convex account
- OpenAI API key

### Local Development
```bash
npm install
npx convex dev     # starts Convex backend + watches for changes
npm run dev        # starts Vite dev server
```

### Environment Variables
```bash
# Convex (set via Convex dashboard)
npx convex env set OPENAI_API_KEY <your-openai-key>

# Frontend (.env.local)
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Production Deploy
```bash
npx convex deploy --cmd 'npx vite build'
```

### Custom Domain
Add DNS records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `cname.vercel-dns.com` |
| A | `@` | `76.76.21.21` |

Then add the domain in your Vercel project settings. SSL is automatic.

---

## 📂 Project Structure

```
convex/                    # Backend
├── schema.ts              # Database schema (26 tables)
├── mirrors.ts             # Mirror CRUD & reflections
├── mirrorPrompts.ts       # Doctrine system prompts
├── ai.ts                  # OpenAI integration (chat, TTS, STT, grading)
├── http.ts                # Direct HTTP endpoints (streaming, voice)
├── roles.ts               # Role system & applicant approval
├── notifications.ts       # Email notifications
├── academy.ts             # Course enrollment & progress
├── training.ts            # Lessons & training scenarios
├── sqlLab.ts              # SQL challenges & AI evaluation
├── infraLab.ts            # Infrastructure scenarios
├── certification.ts       # Exams & certifications
├── community.ts           # Community forum
├── docs.ts                # Document management with file upload
├── admin.ts               # Admin & seed data
└── seedContent.ts         # 78 lessons across 6 courses

src/                       # Frontend
├── pages/                 # 14 pages (Mirror, Academy, SQL Lab, etc.)
├── contexts/              # Theme (7 color schemes)
└── components/            # shadcn/ui components
```

---

## 🔒 Privacy & Security

- **Privacy-first**: Local-first storage, per-user engine isolation
- **No transcripts**: Voice is transcribed in real-time and immediately discarded
- **No telemetry**: No third-party analytics or tracking
- **Encrypted**: All data encrypted at rest and in transit
- **Private repo**: Source code is restricted access only
- **NDA enforced**: All users agree to NDA upon registration

---

## 📜 Legal

- **NDA** — Non-Disclosure Agreement (required at signup)
- **Terms of Use** — Platform usage terms
- **Privacy Policy** — Data rights and protections

All legal documents are encoded within the platform and available under Documentation → Founder Doctrine.

---

## 👤 Founder

**Steven Gonzales** — Vigil Systems, LLC
- Email: steven.gonzales@vigilsysllc.com
- Callsign: DragonLeaderA1

---

## 📋 Spec Compliance

Architecture compliance against `Ground_truth/` canonical specification:

| Component | Spec File | Status |
|-----------|-----------|--------|
| Doctrine Engine | `VIGIL_DOCTRINE.md` | ✅ Implemented |
| Founder Mirror | `VIGIL_FOUNDER_MIRROR.md` | ✅ Implemented |
| Six Pillars | `VIGIL_SIX_PILLARS.md` | ✅ Implemented |
| Waterfall Flow | `VIGIL_WATERFALL_FLOW.md` | ⚠️ Prompt-level only |
| Mirror Instances | `VIGIL_MIRROR_INSTANCES.md` | ✅ Implemented |
| Real-Time Engine | `VIGIL_REAL_TIME_ENGINE.md` | ✅ Implemented |
| User Sovereignty | `VIGIL_USER_SOVEREIGNTY.md` | ✅ Implemented |
| Serverless Deploy | `VIGIL_SERVERLESS_DEPLOYMENT.md` | ✅ Configured |
| Core Twins | `VIGIL_TWINS.md` | ✅ Implemented |
| Verified Intel | `VIGIL_VERIFIED_INTEL.md` | ❌ Not yet implemented |
| Learning Engine | `VIGIL_LEARNING_ENGINE.md` | ⚠️ Partial (baseline only) |

> If code contradicts these specs, the **code is wrong**.
VIGIL Adapative Engine 
---

*VIGIL — Because identity is not negotiable.*
