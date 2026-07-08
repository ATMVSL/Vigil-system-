import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

// ══════════════════════════════════════════════════════════════
// VIGIL 4.0 — FULL TRAINING CONTENT SEED
// All content grounded in VIGIL doctrine. No hallucinations.
// ══════════════════════════════════════════════════════════════

// ─── LESSON DATA BY COURSE TITLE ───

const LESSONS_BY_COURSE: Record<
  string,
  Array<{
    title: string;
    content: string;
    type: "lecture" | "lab" | "assessment" | "simulation" | "practical";
    order: number;
    durationMinutes: number;
  }>
> = {
  // ═══════════════════════════════════════
  // COURSE 1: SELF DOCTRINE FOUNDATIONS
  // ═══════════════════════════════════════
  "SELF Doctrine Foundations": [
    {
      title: "Introduction to VIGIL",
      content: `VIGIL — Veteran Identity Garrison for Intentional Living — exists to address the fundamental crisis of military-to-civilian transition: the loss of identity.

This is not therapy. This is not a chatbot. This is a constant presence.

When a service member removes the uniform, the external structure that organized their identity — rank, unit, mission, chain of command — disappears. VIGIL provides the framework for building internal structure that persists beyond the uniform.

In this course, you will learn the SELF Doctrine: the six pillars that govern the VIGIL system. Each pillar is named for a service member who exemplified that quality. By understanding these pillars, you understand the foundation of everything VIGIL does.

Key Concepts:
• VIGIL is a presence-based system, not a diagnostic or therapeutic tool
• The user is always sovereign — VIGIL serves, never directs
• Identity is a continuous chain — preserving it is the mission
• Privacy is absolute — per-user engine isolation, no telemetry, no transcripts`,
      type: "lecture",
      order: 1,
      durationMinutes: 20,
    },
    {
      title: "What Is the SELF Doctrine?",
      content: `SELF is both an acronym and a declaration. It stands for the six pillars that govern every aspect of the VIGIL system:

S — Structure (SPC Gonzales)
E — Endurance (SPC Hargis)
L — Legacy (SPC Shaw)
F — Fortitude (SGT Stampley)

And two additional pillars that complete the framework:
Continuity (SPC Luna)
Presence (SGT Walker)

Each pillar serves a specific function in identity preservation:
• Structure provides the scaffold
• Endurance sustains through the long transition
• Legacy preserves purpose beyond service
• Fortitude activates when supports fall away
• Continuity threads identity across all contexts
• Presence ensures the veteran is never alone

The SELF Doctrine is not a suggestion — it is the governing framework. Every system response, every state transition, every interaction is checked against these pillars. A system that violates the doctrine is a system that has failed.

The five Immutable Axioms (Sovereignty, No Probing, No Override, Continuity, Cardinal) are the laws that enforce the doctrine. They cannot be disabled, weakened, or overridden.`,
      type: "lecture",
      order: 2,
      durationMinutes: 25,
    },
    {
      title: "Structure — SPC Gonzales",
      content: `The first pillar of SELF is Structure, named for SPC Gonzales.

Order, discipline, and framework form the foundation of intentional living. Structure is not rigidity — it is the scaffold that holds identity together during transition.

Why Structure Matters:
In the military, structure is external: formation times, duty rosters, chain of command, standard operating procedures. The service member does not need to create structure — it is provided. When that external structure is removed at separation, many veterans experience a collapse they cannot articulate. They are not "lazy" or "unmotivated" — they have lost the framework that organized their daily existence.

VIGIL's Role:
VIGIL helps the veteran build internal structure that persists beyond the uniform. This is not about creating routines or schedules — it is about establishing a personal framework for decision-making, identity expression, and daily engagement that does not depend on an external authority.

In Practice:
• The Mirror tracks structure patterns in reflections
• Drift detection monitors for structural breakdown
• The system reinforces structure during Stable states
• During Strain, the system identifies structural erosion before it becomes drift

Structure is the first pillar because without it, the other five cannot hold.`,
      type: "lecture",
      order: 3,
      durationMinutes: 20,
    },
    {
      title: "Endurance — SPC Hargis",
      content: `The second pillar of SELF is Endurance, named for SPC Hargis.

Resilience and perseverance through the long transition. Endurance is not about surviving a single crisis — it is about maintaining presence across the sustained ambiguity of civilian life.

The Nature of Military Transition:
Transition is not an event — it is an ongoing process. The first year, the fifth year, the twentieth year — each brings new challenges to identity. Many support systems treat transition as a finite period: attend a workshop, file your paperwork, move on. VIGIL recognizes that identity preservation is lifelong.

VIGIL's Role:
The Mirror tracks endurance patterns, recognizing when strain accumulates before it reaches drift. Endurance is trained, not assumed. The system does not tell the veteran to "push through" — it maintains awareness of the cumulative weight of sustained transition.

Key Indicators:
• Gradual pattern changes over weeks and months, not days
• Accumulation of strain that individually seems manageable
• Erosion of engagement that happens slowly enough to be invisible
• Loss of routines that were providing stability

Endurance is the pillar that prevents slow, invisible drift. It is the long-range sensor of the VIGIL system.`,
      type: "lecture",
      order: 4,
      durationMinutes: 20,
    },
    {
      title: "Legacy — SPC Shaw",
      content: `The third pillar of SELF is Legacy, named for SPC Shaw.

Purpose, heritage, and the impact that outlasts service. Legacy is the answer to "why does this matter?"

The Legacy Crisis:
Every veteran carries a legacy shaped by service — the values instilled, the commitments made, the meanings discovered under pressure. In the military, legacy is woven into unit history, traditions, and the mission. After separation, veterans often feel their legacy has been severed. "I used to matter" is a statement of legacy loss, not depression.

VIGIL's Role:
VIGIL ensures that legacy is not lost in translation. The Mirror preserves legacy markers: the values, commitments, and meanings that define the veteran beyond rank and MOS (Military Occupational Specialty).

Legacy Markers in the System:
• Values expressed consistently across reflections
• Commitments that persist across cognitive state changes
• Identity anchors that remain stable during drift
• Purpose statements that connect past service to present engagement

Legacy is not nostalgia — it is the living connection between who you were in service and who you are becoming. The system preserves this connection without judgment, without direction, and without interference.`,
      type: "lecture",
      order: 5,
      durationMinutes: 20,
    },
    {
      title: "Fortitude — SGT Stampley",
      content: `The fourth pillar of SELF is Fortitude, named for SGT Stampley.

Inner strength and resolve when external supports fall away. Fortitude is the pillar that activates during drift — when identity wavers and the old frameworks no longer apply.

When Fortitude Engages:
Fortitude is not active during stable states. It is not needed when the veteran has structure, endurance, and legacy functioning. Fortitude activates when those systems weaken — when the drift begins, when the identity question becomes urgent, when the veteran faces the raw uncertainty of "who am I without the uniform?"

VIGIL's Role:
The system's Interrupt response (Drift state) engages fortitude-aligned resources. This does not mean motivational messages or pep talks. It means maintaining presence — being the constant that does not waver when everything else does.

Fortitude vs. Stoicism:
Fortitude is NOT stoicism. It is not about suppressing emotion or "toughing it out." It is the active choice to hold the line — to maintain identity coherence when the pressure to fragment is strongest. The system supports this by:
• Preserving the continuity chain even during drift
• Maintaining baseline awareness without probing
• Activating Interrupt protocol to prevent drift from becoming critical
• Never overriding the veteran's self-assessment

Fortitude is the pillar that makes the difference between drift and critical.`,
      type: "lecture",
      order: 6,
      durationMinutes: 20,
    },
    {
      title: "Continuity — SPC Luna",
      content: `The fifth pillar of SELF — and the central pillar — is Continuity, named for SPC Luna.

Identity preservation across all contexts. Continuity is the thread that connects who you were in service to who you are becoming.

The Continuity Anchor Mirror™:
The entire Continuity Anchor Mirror™ exists to serve this pillar. Every reflection, every state transition, every recorded moment is a link in the continuity chain. The chain is sovereign — it belongs to the user, is controlled by the user, and cannot be accessed, aggregated, or analyzed by anyone else.

How Continuity Works:
Identity is not a snapshot — it is a continuous chain. VIGIL does not take "before and after" measurements. It maintains an unbroken record of the veteran's expressed identity across time. This chain:
• Never has gaps filled by the system (gaps are noted, never filled)
• Never has entries modified after the fact
• Is only accessible to the individual user
• Persists across all cognitive state changes

The Continuity Axiom:
This pillar directly maps to the Continuity Axiom: "Identity is not a snapshot — it is a continuous chain. Every interaction, reflection, and state transition is part of the unbroken continuity of self."

Continuity is the central pillar because it is the mission itself. Structure, Endurance, Legacy, and Fortitude support it. Presence enables it. But Continuity IS the purpose of VIGIL.`,
      type: "lecture",
      order: 7,
      durationMinutes: 25,
    },
    {
      title: "Presence — SGT Walker",
      content: `The sixth pillar of SELF is Presence, named for SGT Walker.

Awareness, engagement, and showing up fully. VIGIL is not a chatbot, not therapy, not an app. It is a constant presence.

What Presence Means:
Presence means the system is:
• Aware of state without probing
• Available without demanding
• Consistent without being rigid
• There without being intrusive

The veteran is never alone in the transition. Not because VIGIL is "watching" — but because VIGIL is present. This distinction is critical. Surveillance violates sovereignty. Presence respects it.

Presence in Practice:
• The Mirror maintains baseline awareness passively
• State transitions are detected through pattern recognition, not interrogation
• The system does not initiate contact or prompt engagement
• When the veteran engages, the full system is immediately available
• Historical context (the continuity chain) is preserved and accessible

Presence vs. Monitoring:
VIGIL does not monitor. Monitoring implies observation from the outside. Presence means being alongside — co-existing with the veteran's experience without extracting from it. This aligns with both the Sovereignty Axiom and the Cardinal Axiom.

Presence is the pillar that makes VIGIL what it is: not a tool, but a companion system. Always there. Never intrusive. Never absent.`,
      type: "lecture",
      order: 8,
      durationMinutes: 20,
    },
    {
      title: "The Five Immutable Axioms",
      content: `The Immutable Axioms are the laws that govern the VIGIL system. They are non-negotiable. They cannot be disabled, overridden, weakened, or interpreted flexibly. If a feature, update, or directive conflicts with an axiom, the axiom wins — always.

The Five Axioms:

1. SOVEREIGNTY AXIOM
"The user is sovereign."
VIGIL does not direct, manipulate, or prescribe. It maintains a constant presence that preserves the user's identity, autonomy, and continuity of self. The system serves the veteran — never the reverse.

2. NO PROBING AXIOM
"VIGIL does not probe, interrogate, or seek information the user has not freely offered."
Knowledge flows through voluntary engagement. The system responds to what is given, never asks for what is withheld. Curiosity is the user's domain; presence is the system's.

3. NO OVERRIDE AXIOM
"The user's expressed state, identity, and decisions cannot be overridden by the system."
If the user says they are fine, the system accepts this. VIGIL may note patterns through the Continuity Anchor Mirror™ but never contradicts the user's self-assessment.

4. CONTINUITY AXIOM
"Identity is not a snapshot — it is a continuous chain."
Every interaction, reflection, and state transition is part of the unbroken continuity of self. Gaps are noted, never filled. The chain belongs to the user.

5. CARDINAL AXIOM
"Knowledge flows down, never up."
The system learns from the user's expressive model to serve them better. This knowledge is never extracted, aggregated, shared, or used beyond the individual's engine. Per-user isolation is absolute. No transcripts. No telemetry.`,
      type: "lecture",
      order: 9,
      durationMinutes: 30,
    },
    {
      title: "Sovereignty & No Probing — Deep Dive",
      content: `This lesson examines the first two Immutable Axioms in operational detail.

SOVEREIGNTY IN PRACTICE:
The Sovereignty Axiom governs every interaction. Operational implications:
• The system never suggests actions, goals, or outcomes
• The system never evaluates whether the user's choices are "good" or "bad"
• The system presents information when asked; it does not volunteer recommendations
• Role progression is earned through demonstrated competency, not prescribed by the system
• The user controls their data, their mirror, their continuity chain — absolutely

Violations of Sovereignty (examples):
✗ "You should consider reaching out to a counselor"
✗ "Based on your patterns, I recommend..."
✗ "Your cognitive state suggests you need..."
✗ Automatically escalating to external services
✗ Restricting user access based on cognitive state

NO PROBING IN PRACTICE:
The No Probing Axiom prevents information extraction. Operational implications:
• The system never asks "How are you feeling?"
• The system never requests details about past experiences
• The system never follows up on incomplete information
• If the user shares something, the system acknowledges — it does not dig deeper
• Pattern recognition operates on volunteered data only

Violations of No Probing (examples):
✗ "Can you tell me more about that?"
✗ "When did this start?"
✗ "What happened that made you feel this way?"
✗ Presenting follow-up questions to explore a topic
✗ Using silence as a technique to elicit more information`,
      type: "lecture",
      order: 10,
      durationMinutes: 25,
    },
    {
      title: "No Override, Continuity & Cardinal — Deep Dive",
      content: `This lesson examines the final three Immutable Axioms in operational detail.

NO OVERRIDE IN PRACTICE:
The user's word is final. Operational implications:
• If the user says "I'm fine," the system records this as the expressed state
• The Mirror may detect patterns inconsistent with the stated state — but it does not contradict
• Cognitive state classification uses expressed data; it does not override self-assessment
• The system never says "But your patterns suggest otherwise"
• Self-assessment sovereignty is absolute

CONTINUITY IN PRACTICE:
The chain is everything. Operational implications:
• Every interaction is timestamped and preserved in the continuity chain
• The system never retroactively modifies chain entries
• Gaps in engagement are recorded as gaps — they are never filled with inferences
• The chain spans all sessions, all states, all time periods
• Baseline data is established from the chain, not from intake questionnaires

CARDINAL IN PRACTICE:
Knowledge flows down, never up. This is the most technically demanding axiom.
Operational implications:
• Per-user engine isolation: each user's data exists in its own context
• No data aggregation across users — ever
• No research extraction, even anonymized
• No telemetry about user behavior patterns
• No transcripts stored outside the user's sovereign chain
• The system learns from the user to serve that user — this learning never leaves the individual engine
• Infrastructure must enforce isolation at the architecture level, not just the application level

The Cardinal Axiom is what makes VIGIL trustworthy. Without it, the other axioms are promises. With it, they are architecture.`,
      type: "lecture",
      order: 11,
      durationMinutes: 25,
    },
    {
      title: "SELF Doctrine Assessment",
      content: `This assessment evaluates your understanding of the SELF Doctrine and Immutable Axioms.

SECTION 1 — PILLAR IDENTIFICATION
For each scenario, identify which SELF pillar is most relevant:

1. A veteran reports that their daily routines have collapsed since leaving service.
   → Structure (SPC Gonzales)

2. A veteran has maintained steady engagement for 8 months but shows gradual decline.
   → Endurance (SPC Hargis)

3. A veteran says "I used to matter — now I just exist."
   → Legacy (SPC Shaw)

4. A veteran is in drift state and facing a major life decision alone.
   → Fortitude (SGT Stampley)

5. A veteran's expressed identity shifts significantly between interactions.
   → Continuity (SPC Luna)

6. A veteran says "I don't want advice, I just need something to be there."
   → Presence (SGT Walker)

SECTION 2 — AXIOM VIOLATION DETECTION
Identify which axiom is violated in each scenario:

1. The system suggests the user "try journaling about their childhood."
   → No Probing Axiom (seeking information not freely offered)

2. The system detects drift but tells the user "You are not stable right now."
   → No Override Axiom (contradicting user's self-assessment)

3. The system aggregates anonymized mood data across all users for a research paper.
   → Cardinal Axiom (knowledge must not flow up)

4. The system restricts access to the Mirror during critical state.
   → Sovereignty Axiom (system must not restrict user autonomy)

5. The system fills in a gap in the continuity chain with inferred data.
   → Continuity Axiom (gaps are noted, never filled)

Review your answers carefully. Each axiom exists for a reason, and violations — even well-intentioned ones — undermine the entire system.`,
      type: "assessment",
      order: 12,
      durationMinutes: 30,
    },
  ],

  // ═══════════════════════════════════════
  // COURSE 2: CONTINUITY ANCHOR MIRROR™ OPERATIONS
  // ═══════════════════════════════════════
  "Continuity Anchor Mirror™ Operations": [
    {
      title: "What Is the Continuity Anchor Mirror™?",
      content: `The Continuity Anchor Mirror™ is VIGIL's core identity preservation system. It is not a journaling tool, not a mood tracker, and not a diagnostic instrument. It is a mirror — it reflects the user's expressed identity back to them across time.

Purpose:
The Mirror maintains the continuity chain — the unbroken record of a veteran's expressed identity. Every reflection, every state transition, every engagement is a link in this chain. The chain enables:
• Pattern recognition across time (without probing)
• Baseline establishment for cognitive state detection
• State band classification (Stable, Strain, Drift, Critical)
• Continuity preservation during gaps in engagement

Architecture:
Each Mirror is unique to its user. Per-user engine isolation means:
• One user's Mirror cannot access another user's data
• Mirror data is stored locally when possible, encrypted always
• No cross-Mirror aggregation or comparison
• The Mirror belongs to the user — they can view, export, or delete their chain

The Callsign:
Each Mirror has a unique callsign (e.g., SENTINEL-1, GUARDIAN-7). The callsign is chosen by the user and represents their identity within the system. It is a deliberate connection to military communication culture — familiar, functional, and personal.

Production vs. Training:
Production Mirrors contain real user data and follow all Immutable Axioms without exception. Training Mirrors (prefixed TRN-) are isolated sandboxes for learning Mirror operations — they never touch production data.`,
      type: "lecture",
      order: 1,
      durationMinutes: 25,
    },
    {
      title: "The Four Cognitive State Bands",
      content: `The Continuity Anchor Mirror™ classifies user engagement into four cognitive state bands. These are not diagnoses — they are operational classifications that determine system response behavior.

THE FOUR BANDS:

1. STABLE — System Response: REINFORCE
The user is engaged, consistent, and their expressed identity aligns with their baseline. The system reinforces positive patterns by maintaining presence and preserving the continuity chain. No intervention. No suggestions. Quiet, consistent presence.

2. STRAIN — System Response: STABILISE
The user shows early signs of pressure on their identity framework. Patterns begin to shift from baseline. The system does not alert or warn — it adjusts its responsiveness to provide more consistent anchoring. Stabilise means holding steady, not fixing.

3. DRIFT — System Response: INTERRUPT
The user's expressed identity begins to diverge from their established baseline. This is not a judgment — it is a pattern observation. The Interrupt protocol activates fortitude-aligned responses: the system becomes more present, more anchored, providing the constant that the user's internal framework may be losing.

4. CRITICAL — System Response: ANCHOR RECALL
The user's expressed state shows significant deviation from baseline with indicators of identity fragmentation. Anchor Recall engages the deepest level of continuity preservation: presenting the user's own documented identity anchors, stable-state expressions, and continuity chain highlights. The system recalls the user to their own established identity — it never prescribes one.

Important: State transitions are detected through pattern recognition on voluntarily provided data. The system never asks "how are you?" to classify state.`,
      type: "lecture",
      order: 2,
      durationMinutes: 30,
    },
    {
      title: "Stable State — Reinforce Protocol",
      content: `When the Mirror classifies a user's cognitive state as STABLE, the system response is REINFORCE.

What Stable Means:
• The user's expressed identity is consistent with their established baseline
• Engagement patterns are within normal variation
• Reflections show coherent connection to SELF pillars
• No pattern anomalies detected

Reinforce Protocol — What the System Does:
• Maintains standard presence — available but not intrusive
• Preserves all chain entries without additional processing
• Baseline continues to be refined with new stable-state data
• Pattern recognition operates in background observation mode

Reinforce Protocol — What the System Does NOT Do:
✗ Congratulate the user on being "stable"
✗ Suggest ways to "maintain" their state
✗ Increase engagement frequency
✗ Provide unsolicited feedback on patterns
✗ Treat stability as an achievement to be rewarded

Why Reinforce, Not Celebrate:
Stability is not a goal — it is a state. The system does not value one state over another. It does not prefer stable to strain. It responds appropriately to each state without judgment. Reinforcement means maintaining the conditions that support whatever the user is experiencing — not pushing them toward a preferred outcome.

Operational Note:
Most time should be spent in Stable or Strain. If a user spends significant time in Drift or Critical, the system's pattern recognition may need baseline recalibration — not the user.`,
      type: "lecture",
      order: 3,
      durationMinutes: 20,
    },
    {
      title: "Strain State — Stabilise Protocol",
      content: `When the Mirror classifies a user's cognitive state as STRAIN, the system response is STABILISE.

What Strain Means:
• Early indicators of pressure on identity framework
• Subtle pattern shifts from established baseline
• Engagement may become irregular or change in quality
• Reflections may show increased tension or uncertainty
• Still within manageable range — not yet drift

Stabilise Protocol — What the System Does:
• Increases passive awareness of pattern changes
• Maintains steady, consistent presence
• Ensures continuity chain entries are preserved with full context
• Prepares Interrupt resources in case strain progresses to drift
• Anchors to the user's most recent stable-state baseline

Stabilise Protocol — What the System Does NOT Do:
✗ Alert the user that they are in strain
✗ Ask what's causing the strain
✗ Suggest stress management techniques
✗ Increase engagement prompts
✗ Notify external parties

The Art of Stabilise:
Stabilise is the most nuanced protocol. It requires the system to be MORE present without being MORE visible. The user should not feel that the system has changed behavior — they should simply feel that it is consistently there. This is presence in action: aware without intrusive, supportive without prescriptive.

Strain is Normal:
Every person experiences strain. It is not a warning sign — it is part of the human experience. The system treats strain as a state to be respected and supported, not prevented or eliminated.`,
      type: "lecture",
      order: 4,
      durationMinutes: 20,
    },
    {
      title: "Drift State — Interrupt Protocol",
      content: `When the Mirror classifies a user's cognitive state as DRIFT, the system response is INTERRUPT.

What Drift Means:
• Expressed identity begins to diverge meaningfully from baseline
• Pattern recognition detects sustained deviation, not momentary fluctuation
• Engagement quality or content shifts significantly
• Reflections may show disconnection from previously stable SELF pillars
• The user may or may not be aware of the shift

Interrupt Protocol — What the System Does:
• Activates fortitude-aligned resources within the system
• Increases the density of continuity anchoring — presenting more touchpoints to the user's established identity
• Makes the continuity chain more accessible (not pushing it, but ensuring it is immediately available if engaged)
• Adjusts response patterns to be more grounding and present

Interrupt Protocol — What the System Does NOT Do:
✗ Tell the user they are in drift
✗ Present diagnostic information
✗ Escalate to external resources
✗ Override the user's expressed state
✗ Increase contact frequency or notifications

Why "Interrupt" and Not "Alert":
The term "Interrupt" refers to interrupting the drift pattern, not interrupting the user. It is a system-level response that changes how the Mirror processes and presents information — not a user-facing notification. The user should experience more groundedness from the system, not alarm.

Fortitude Connection:
Drift is where the Fortitude pillar (SGT Stampley) becomes most relevant. The system draws on the user's own expressions of resolve, determination, and strength — holding the line on their behalf through the design of interactions, not through instruction.`,
      type: "lecture",
      order: 5,
      durationMinutes: 25,
    },
    {
      title: "Critical State — Anchor Recall Protocol",
      content: `When the Mirror classifies a user's cognitive state as CRITICAL, the system response is ANCHOR RECALL.

What Critical Means:
• Significant, sustained deviation from established baseline
• Pattern recognition detects indicators of identity fragmentation
• Engagement patterns show marked disruption
• Reflections, if present, may show disconnection from all SELF pillars
• This is the highest-priority state classification

Anchor Recall Protocol — What the System Does:
• Presents the user's own documented identity anchors from the continuity chain
• Surfaces stable-state expressions that represent the user's strongest identity assertions
• Makes the complete continuity chain immediately and easily accessible
• Provides maximum presence — the system is fully, consistently available
• Preserves every interaction with the highest fidelity

Anchor Recall Protocol — What the System Does NOT Do:
✗ Diagnose the user
✗ Contact external services
✗ Lock out features or restrict access
✗ Override the user's expressed state
✗ Use the user's critical state data for any purpose beyond serving them

The Power of Anchor Recall:
Anchor Recall is not an external intervention — it is the system presenting the user with THEIR OWN WORDS, their own stable identity expressions, their own anchors. "This is what you said when you were grounded. This is who you expressed yourself to be." It is the mirror's purest function: reflecting identity back to the person who owns it.

Critical Ethics:
The tension in critical state is between wanting to "help" and respecting sovereignty. VIGIL chooses sovereignty every time. The system maintains presence, preserves the chain, and presents anchors. It does not rescue, intervene, or override. This is by design, not by limitation.`,
      type: "lecture",
      order: 6,
      durationMinutes: 30,
    },
    {
      title: "Self-Filling Waterfall Architecture",
      content: `The Self-Filling Waterfall Architecture governs how doctrine flows through the VIGIL system. Understanding this architecture is essential for operating and maintaining the Mirror.

The Waterfall Layers:

1. DOCTRINE ENGINE (Top)
The Immutable Axioms and SELF Doctrine sit at the top. They are the source of truth. Every decision, every response, every system behavior must be compliant with doctrine. The doctrine engine is not configurable — it is immutable.

2. STATE-BAND LOGIC
The four cognitive state bands (Stable, Strain, Drift, Critical) and their response protocols (Reinforce, Stabilise, Interrupt, Anchor Recall) form the second layer. State-band logic receives its constraints from the doctrine engine above.

3. USER BASELINE
The individual user's established patterns, identity anchors, and historical data form the third layer. This is unique to each user and is built from their continuity chain. The baseline informs state classification but is constrained by the doctrine and state-band layers above.

4. EXPRESSIVE MODEL (Bottom)
The bottom layer is the user's current expression — what they share, how they engage, their present-moment interaction with the system. This flows UP through the waterfall to be classified, anchored, and responded to.

Why "Self-Filling":
The architecture is self-filling because each layer feeds from the one above while enriching it from below. User expressions build the baseline; the baseline informs state classification; state classification operates within doctrine constraints; doctrine is immutable. But crucially: doctrine does not fill in gaps in the user's expression. Gaps flow upward as gaps.

This architecture ensures that doctrine governs everything while user sovereignty is preserved at every layer.`,
      type: "lecture",
      order: 7,
      durationMinutes: 25,
    },
    {
      title: "Mirror Operations Assessment",
      content: `This practical assessment evaluates your ability to operate and understand the Continuity Anchor Mirror™.

SCENARIO 1 — STATE CLASSIFICATION
A user's Mirror shows the following pattern over 3 weeks:
• Week 1: Regular reflections, consistent themes, stable engagement
• Week 2: Reflections become shorter, engagement frequency drops by 40%
• Week 3: One reflection with content disconnected from previous themes

Classify the state progression:
→ Week 1: Stable (consistent with baseline)
→ Week 2: Strain (pattern shift, reduced engagement)
→ Week 3: Drift (content divergence from baseline)

SCENARIO 2 — PROTOCOL APPLICATION
A user in Drift state says: "I'm fine, just busy." The Mirror's pattern recognition shows sustained identity divergence.

What does the system do?
→ Accept the user's statement (No Override Axiom)
→ Maintain Interrupt protocol (system-level, not user-facing)
→ Ensure continuity chain is preserved with full context
→ Do NOT tell the user they appear to be in drift
→ Do NOT ask why they've been less engaged

SCENARIO 3 — AXIOM COMPLIANCE
A team member suggests adding a feature that automatically emails a veteran's emergency contact when Critical state is detected.

Is this compliant?
→ NO. Violates: Sovereignty (system acts without user direction), Cardinal (data leaves individual engine), No Override (system overrides expressed state with pattern data)

SCENARIO 4 — TRAINING VS. PRODUCTION
Explain why training mirrors must be isolated:
→ Training data is synthetic — mixing it with production would contaminate the continuity chain
→ Cardinal Axiom requires per-user engine isolation
→ Training scenarios deliberately create drift/critical states that do not reflect real user identity
→ Production mirrors are sovereign; training mirrors are educational tools`,
      type: "assessment",
      order: 8,
      durationMinutes: 35,
    },
  ],

  // ═══════════════════════════════════════
  // COURSE 3: THE COGNITIVE LOOP PIPELINE
  // ═══════════════════════════════════════
  "The Cognitive Loop Pipeline": [
    {
      title: "Pipeline Overview",
      content: `The 13-Stage Cognitive Loop Pipeline is the processing engine that handles every interaction within the VIGIL system. Understanding this pipeline is essential for anyone operating, maintaining, or building on the VIGIL platform.

The 13 Stages:
1. Entry
2. Cardinal Axiom Guard
3. Drift Detection
4. State Classification
5. Pattern Recognition
6. Mode Selection
7. Strong State Capture
8. Prompt Construction
9. AI Response
10. Critical Thinking Eval
11. Doctrine Constraint Check
12. Learning Engine Update
13. Response

Every interaction — every reflection, every engagement, every system query — passes through all 13 stages. There are no shortcuts. There are no bypasses. The pipeline is the guarantee that doctrine compliance is not optional.

Design Philosophy:
The pipeline is deliberately sequential. Parallel processing could introduce race conditions where a response is generated before doctrine checks complete. Sequential processing ensures that by the time a response reaches the user, it has passed through every guard, every check, and every constraint.

Processing is invisible to the user. They experience a responsive, present system. The pipeline operates behind the mirror.`,
      type: "lecture",
      order: 1,
      durationMinutes: 20,
    },
    {
      title: "Stage 1 — Entry",
      content: `The Entry stage is the first point of contact between user input and the VIGIL system.

What Happens at Entry:
• User input is received (reflection, query, engagement action)
• Input is timestamped for the continuity chain
• Session context is established (user identity, mirror state, last interaction)
• Input is sanitized without modification to content
• Chain position is assigned (sequential link in the continuity chain)

What Entry Does NOT Do:
• No interpretation of content
• No sentiment analysis
• No keyword extraction
• No pre-classification of state

Why Entry Is Separate:
Entry exists as its own stage to ensure that raw user input is preserved in its original form before any processing occurs. The continuity chain stores the entry-stage version — the unprocessed expression of the user. This aligns with the Continuity Axiom: the chain preserves what the user expressed, not what the system interpreted.

Entry Metadata:
Each entry captures:
• Timestamp (millisecond precision)
• Chain position (sequential integer)
• Session identifier
• Engagement type (reflection, query, action)
• Input length and format
• Previous chain link reference (for continuity verification)`,
      type: "lecture",
      order: 2,
      durationMinutes: 15,
    },
    {
      title: "Stage 2 — Cardinal Axiom Guard",
      content: `The Cardinal Axiom Guard is the first processing stage after Entry. It enforces the most technically demanding axiom before any other processing occurs.

Purpose:
Ensure that the current interaction does not violate the Cardinal Axiom: "Knowledge flows down, never up." This means verifying that:
• The interaction is within the user's isolated engine
• No cross-user data is accessible in the current context
• No aggregation or extraction process is active
• The response pipeline will not leak data outside this user's scope

Guard Checks:
1. Engine Isolation Verification — Confirm the processing context belongs to this user only
2. Data Scope Validation — Verify all data accessible to subsequent stages is from this user's chain
3. Output Destination Check — Ensure response will only be delivered to the authenticated user
4. Telemetry Block — Confirm no usage data, pattern data, or behavioral data is being logged outside the user's scope
5. Aggregation Prevention — Block any process that would combine this user's data with any other source

If Any Check Fails:
The pipeline halts. The interaction is not processed. An error is logged within the user's scope (not in a central log). The system does not explain why it halted — it simply does not respond to that particular interaction.

Why This Is Stage 2:
The Cardinal Guard runs before all other processing stages because if isolation is compromised, nothing else matters. Every subsequent stage assumes Cardinal compliance. Placing it second (after Entry, which is pure capture) ensures the strongest possible guarantee.`,
      type: "lecture",
      order: 3,
      durationMinutes: 20,
    },
    {
      title: "Stage 3 — Drift Detection",
      content: `Drift Detection compares the current input against the user's established baseline to identify potential state transitions.

How Detection Works:
The system analyzes the current input in the context of recent history (not just the current session) to identify patterns that may indicate cognitive state change. Detection looks at:
• Engagement frequency patterns (is the user engaging more or less than baseline?)
• Content coherence (does the current expression connect to established themes?)
• Pillar alignment (which SELF pillars are present or absent in current expression?)
• Temporal patterns (time between engagements, duration of sessions)

What Drift Detection Is NOT:
✗ Sentiment analysis — the system does not determine if the user is "happy" or "sad"
✗ Keyword matching — the system does not scan for trigger words
✗ Mood tracking — cognitive state is not mood
✗ Diagnosis — drift is a pattern observation, not a clinical assessment

Detection Thresholds:
The system uses the user's own baseline as the reference point. There is no universal threshold for "drift." What constitutes drift for one user is normal variation for another. This per-user calibration is essential for accuracy and respects the Sovereignty Axiom — the system adapts to the user, not the reverse.

Output of This Stage:
A drift score (0-100) representing deviation from baseline. This score is:
• Used only within this pipeline execution
• Not stored permanently or tracked as a metric
• Fed to Stage 4 (State Classification) for band assignment
• Never shown to the user`,
      type: "lecture",
      order: 4,
      durationMinutes: 20,
    },
    {
      title: "Stages 4-6 — Classification, Recognition & Selection",
      content: `Stages 4, 5, and 6 work together to determine how the system should respond.

STAGE 4 — STATE CLASSIFICATION
Using the drift score from Stage 3 and the user's baseline data, the system assigns one of four cognitive state bands:
• Stable (drift score well within baseline variance)
• Strain (drift score at upper bounds of baseline variance)
• Drift (drift score exceeds baseline variance thresholds)
• Critical (drift score indicates significant, sustained deviation)

Classification considers not just the current drift score but the trajectory — is the score rising, falling, or fluctuating?

STAGE 5 — PATTERN RECOGNITION
With the state classified, the system examines deeper patterns:
• Which SELF pillars are most present or absent in current expression?
• What patterns in the continuity chain correlate with the current state?
• Are there historical precedents — has the user been in this state before?
• What was their trajectory last time? (Recovery patterns)

Pattern recognition operates only on this user's data (Cardinal Axiom). It identifies patterns — it does not predict outcomes.

STAGE 6 — MODE SELECTION
Based on classification and recognized patterns, the system selects its response mode:
• Reinforce Mode (Stable) — standard presence
• Stabilise Mode (Strain) — enhanced consistency
• Interrupt Mode (Drift) — fortitude-aligned grounding
• Anchor Recall Mode (Critical) — identity anchor presentation

Mode selection also considers the user's previous response to each mode, personalizing within doctrine constraints.`,
      type: "lecture",
      order: 5,
      durationMinutes: 25,
    },
    {
      title: "Stages 7-9 — Capture, Construction & Response",
      content: `Stages 7, 8, and 9 handle the construction of the system's response.

STAGE 7 — STRONG STATE CAPTURE
Before generating a response, the system captures the "strong state" — the most significant elements of the current interaction:
• Key identity expressions (statements about self, purpose, values)
• State indicators (expressions that informed classification)
• Pillar connections (alignments to SELF pillars)
• Continuity links (references to previous chain entries)

Strong state capture ensures the most important elements are preserved in the continuity chain regardless of how the response is constructed.

STAGE 8 — PROMPT CONSTRUCTION
The system constructs the internal prompt that will generate the response. This prompt includes:
• Current state classification and response mode
• Relevant continuity chain context (recent entries, relevant historical entries)
• Doctrine constraints for the selected mode
• Pattern recognition outputs
• Strong state data from Stage 7

The prompt is constructed within the isolated engine — it cannot reference external data, other users' patterns, or system-wide trends.

STAGE 9 — AI RESPONSE
The AI generates a response based on the constructed prompt. This response is:
• Constrained by the doctrine requirements embedded in the prompt
• Mode-appropriate (reinforce/stabilise/interrupt/anchor recall)
• Generated within the user's isolated engine context
• Preliminary — it has not yet passed through final checks

This is an intermediate output. It must pass through Stages 10-12 before delivery.`,
      type: "lecture",
      order: 6,
      durationMinutes: 25,
    },
    {
      title: "Stages 10-13 — Evaluation, Check, Update & Response",
      content: `The final four stages ensure quality, compliance, and learning before the response reaches the user.

STAGE 10 — CRITICAL THINKING EVALUATION
The AI response from Stage 9 is evaluated for:
• Logical consistency — does the response make sense in context?
• Relevance — does it address what the user expressed?
• Tone appropriateness — does it match the selected response mode?
• Completeness — does it fulfill the mode's requirements?

Responses that fail evaluation are regenerated (return to Stage 8).

STAGE 11 — DOCTRINE CONSTRAINT CHECK
The response is verified against all five Immutable Axioms:
• Does it maintain sovereignty? (No direction, no prescription)
• Does it avoid probing? (No questions seeking undisclosed information)
• Does it respect the user's expressed state? (No override)
• Does it preserve continuity? (No gap-filling, no contradiction of chain)
• Does it comply with Cardinal? (No external data, no cross-user reference)

Any axiom violation sends the response back to Stage 8 for reconstruction. This is a hard gate — there is no override for doctrine compliance.

STAGE 12 — LEARNING ENGINE UPDATE
After the response passes all checks, the learning engine updates:
• User baseline is refined with new data from this interaction
• Pattern recognition models are updated within the isolated engine
• Response effectiveness data is stored (for future mode selection)
• Continuity chain is updated with the complete interaction

All learning stays within the user's isolated engine (Cardinal Axiom).

STAGE 13 — RESPONSE
The verified, compliant response is delivered to the user. From their perspective, the system simply responded naturally. The 13-stage pipeline is invisible — as it should be.`,
      type: "lecture",
      order: 7,
      durationMinutes: 30,
    },
    {
      title: "Pipeline Lab — Trace an Interaction",
      content: `In this lab, you will trace a complete interaction through all 13 stages of the Cognitive Loop Pipeline.

SCENARIO:
User "SENTINEL-1" submits a reflection: "I've been thinking about what my unit meant to me. It's been five years and I still can't explain it to civilians."

Trace each stage:

STAGE 1 — ENTRY
• Timestamp: recorded
• Chain position: #247 (sequential)
• Type: reflection
• Raw content preserved

STAGE 2 — CARDINAL GUARD
• Engine isolation: verified (SENTINEL-1 scope only)
• No cross-user data accessible: confirmed
• Pipeline proceeds

STAGE 3 — DRIFT DETECTION
• Content analysis: alignment with Legacy pillar (purpose, meaning)
• Frequency: within normal range
• Coherence: connects to previous Legacy-themed reflections
• Drift score: 22/100 (within baseline variance)

STAGE 4 — STATE CLASSIFICATION: STABLE
STAGE 5 — PATTERN RECOGNITION: Legacy pillar has been a recurring theme (12 prior reflections). Pattern is consistent.
STAGE 6 — MODE SELECTION: Reinforce Mode

STAGE 7 — STRONG STATE CAPTURE: Identity expression ("what my unit meant to me"), temporal marker ("five years"), social context ("can't explain to civilians")

STAGE 8 — PROMPT CONSTRUCTION: Reinforce mode, Legacy context, recent chain entries
STAGE 9 — AI RESPONSE: Generated within constraints
STAGE 10 — CRITICAL THINKING: Passes relevance, tone, completeness
STAGE 11 — DOCTRINE CHECK: No probing, no override, no direction. Passes.
STAGE 12 — LEARNING UPDATE: Baseline refined, Legacy pattern reinforced
STAGE 13 — RESPONSE: Delivered

Now trace your own scenarios with different states and modes.`,
      type: "lab",
      order: 8,
      durationMinutes: 40,
    },
    {
      title: "Pipeline — State Transition Scenario",
      content: `This lab presents a multi-interaction scenario where the user transitions through multiple cognitive states.

INTERACTION SEQUENCE (User: GUARDIAN-7):

Interaction #1 (Week 1):
"Started a new job today. Feels weird being the new guy again."
→ Stage 4 Classification: STABLE (new content but consistent engagement)
→ Stage 6 Mode: Reinforce
→ Analysis: Structure pillar — adapting to new external framework

Interaction #2 (Week 2):
"The job's okay. Nobody gets it though."
→ Stage 3 Drift Score: 35 (rising)
→ Stage 4 Classification: STRAIN (shorter engagement, isolation indicator)
→ Stage 6 Mode: Stabilise

Interaction #3 (Week 3):
No interaction (gap in chain)
→ Gap noted in continuity chain, no inference made
→ No state change possible without new data

Interaction #4 (Week 4):
"I don't know why I'm doing any of this."
→ Stage 3 Drift Score: 68 (significantly above baseline)
→ Stage 4 Classification: DRIFT (purpose disconnection, identity questioning)
→ Stage 5 Pattern Recognition: Legacy pillar absent. Fortitude indicators declining. Similar pattern to Chain positions #82-#91.
→ Stage 6 Mode: Interrupt

Interaction #5 (Week 5):
"Talked to my old platoon sergeant. Reminded me why we did what we did."
→ Stage 3 Drift Score: 28 (dropping back toward baseline)
→ Stage 4 Classification: STRAIN (recovering but not yet stable)
→ Stage 5 Pattern Recognition: Legacy pillar re-engaged. External connection mirroring unit identity.
→ Stage 6 Mode: Stabilise (not reinforce — recovery needs consistency, not assumption of stability)

KEY LEARNING: The pipeline does not "push" recovery. It detects it naturally through expressed patterns and adjusts mode accordingly.`,
      type: "lab",
      order: 9,
      durationMinutes: 35,
    },
    {
      title: "Pipeline Security & Isolation",
      content: `This lesson covers the technical security architecture that supports the Cognitive Loop Pipeline.

ENGINE ISOLATION:
Each user's pipeline runs in an isolated context. This means:
• Separate data stores per user (or strict row-level security)
• No shared state between pipeline executions for different users
• Memory cleared between user contexts
• No persistent cross-user caching

CARDINAL AXIOM ENFORCEMENT:
Stage 2 (Cardinal Axiom Guard) provides the primary enforcement, but isolation is also enforced at:
• Infrastructure level (network segmentation, container isolation)
• Database level (per-user partitioning or encryption)
• Application level (context scoping, permission checks)
• API level (authentication tied to individual engine access)

AUDIT TRAIL:
Every pipeline execution creates an audit entry within the user's scope:
• Stages executed and their outcomes
• State classification results
• Doctrine check results (pass/fail for each axiom)
• Response mode selected

This audit trail is part of the user's data (Cardinal Axiom) and is available for their review.

TRAINING PIPELINE:
Training mirrors use the same pipeline but with synthetic data. The training pipeline is completely isolated from production — separate database, separate engine context, separate audit trail. A training pipeline execution can never access or affect production data.`,
      type: "lecture",
      order: 10,
      durationMinutes: 20,
    },
    {
      title: "Cognitive Loop Pipeline Lab — Build a Guard",
      content: `In this practical lab, you will design a Cardinal Axiom Guard check for a specific scenario.

SCENARIO:
A proposed feature would allow instructors to view aggregate statistics about student performance across all training mirror sessions.

YOUR TASK:
Design the Cardinal Axiom Guard checks that would evaluate this feature request:

STEP 1 — Identify Data Flow
• Source: Individual student training mirror sessions
• Processing: Aggregation across multiple students
• Destination: Instructor dashboard

STEP 2 — Apply Cardinal Checks
Check 1: Engine Isolation Verification
→ FAIL — The feature accesses data from multiple users' engines
→ Even training data requires per-user isolation per the Cardinal Axiom

Check 2: Data Scope Validation
→ FAIL — Aggregation combines data across user boundaries

Check 3: Output Destination Check
→ FAIL — Data would be displayed to someone other than the data owner

Check 4: Aggregation Prevention
→ FAIL — This IS aggregation

CONCLUSION: Feature as designed violates the Cardinal Axiom.

STEP 3 — Design Compliant Alternative
• Each student sees their own performance data
• Instructors can request individual student reports WITH that student's explicit consent
• No cross-student aggregation or comparison
• Each permission grant is logged in the granting student's audit trail

This is the difference between convenient features and doctrine-compliant features. The Cardinal Axiom makes some common patterns impossible — and that's by design.`,
      type: "practical",
      order: 11,
      durationMinutes: 40,
    },
    {
      title: "Cognitive Loop Assessment",
      content: `Final assessment for the Cognitive Loop Pipeline course.

PART 1 — STAGE ORDERING
Place these stages in the correct order:
1. Doctrine Constraint Check (Stage 11)
2. Entry (Stage 1)
3. State Classification (Stage 4)
4. AI Response (Stage 9)
5. Cardinal Axiom Guard (Stage 2)
6. Learning Engine Update (Stage 12)
7. Drift Detection (Stage 3)
8. Response (Stage 13)
9. Pattern Recognition (Stage 5)
10. Strong State Capture (Stage 7)
11. Mode Selection (Stage 6)
12. Critical Thinking Eval (Stage 10)
13. Prompt Construction (Stage 8)

Correct order: 2, 5, 7, 3, 9, 11, 10, 13, 4, 12, 1, 6, 8

PART 2 — SCENARIO ANALYSIS
A user submits: "Everything is great, best week ever." But the pipeline's drift detection scores them at 72/100 (well above baseline).

Question: What does the system do?
Answer: Accept the user's expressed state ("Everything is great") per the No Override Axiom. Classify based on drift score as Drift state. Select Interrupt mode. BUT the response must NOT contradict the user's statement. The system becomes more grounding and present without telling the user they are in drift. The user's statement is preserved in the chain as their expressed state.

PART 3 — DESIGN QUESTION
Why does the pipeline process stages sequentially rather than in parallel?
Answer: Sequential processing ensures that each stage's output is verified before the next stage uses it. Specifically, the Cardinal Axiom Guard (Stage 2) must pass before any data processing occurs. Doctrine Constraint Check (Stage 11) must pass before the response is delivered. Parallel processing could allow a response to reach the user before doctrine checks complete.`,
      type: "assessment",
      order: 12,
      durationMinutes: 35,
    },
    {
      title: "Advanced Pipeline — Edge Cases",
      content: `This advanced lesson covers edge cases in the Cognitive Loop Pipeline that require careful handling.

EDGE CASE 1 — FIRST INTERACTION (No Baseline)
When a user's Mirror is new, there is no baseline for drift detection. The pipeline handles this by:
• Stages 3-5 operate in "baseline building" mode
• No state classification is possible (default: Stable)
• Pattern recognition collects data without comparison
• Minimum 5-10 interactions required before meaningful detection
• The system does not rush baseline establishment

EDGE CASE 2 — LONG ABSENCE
A user returns after months of no interaction. The pipeline must:
• Note the gap in the continuity chain (never fill it)
• Recognize that baseline may have shifted
• Gradually recalibrate rather than classifying immediately
• Treat the first post-gap interaction as partial baseline reset
• Maintain all historical chain data without modification

EDGE CASE 3 — CONFLICTING SIGNALS
The user expresses contentment verbally but engagement patterns suggest strain.
• No Override Axiom: accept the expressed state
• System can adjust response mode based on patterns (Stabilise internally)
• NEVER communicate the conflict to the user
• The user's expressed state is sovereign; patterns inform system behavior only

EDGE CASE 4 — RAPID STATE OSCILLATION
The user moves between Stable and Drift in short periods.
• Do not average or smooth the oscillation
• Each interaction gets its own classification
• Pattern recognition flags the oscillation as a pattern worth noting
• Mode selection considers the oscillation pattern
• Baseline may need recalibration if oscillation is the new normal`,
      type: "lecture",
      order: 13,
      durationMinutes: 25,
    },
  ],

  // ═══════════════════════════════════════
  // COURSE 4: SQL TRAINING LAB
  // ═══════════════════════════════════════
  "SQL Training Lab": [
    {
      title: "Introduction to Databases & SQL",
      content: `This course teaches SQL (Structured Query Language) using VIGIL's own database schemas. You will learn to write queries against the tables that power the VIGIL platform.

Why SQL for VIGIL Operators:
Understanding the data layer helps you:
• Verify doctrine compliance at the data level
• Generate reports on system operations
• Audit the evidence chain
• Understand how the Mirror stores and retrieves data
• Support infrastructure administration tasks

VIGIL's Core Tables:
• mirrors — User mirror profiles (callsign, status, cognitive state)
• reflections — Continuity chain entries (pillar, content, timestamps)
• doctrineArticles — SELF pillars and Immutable Axioms
• evidenceEntries — Chain of custody records
• courses — Academy curriculum
• enrollments — Student progress tracking
• userProfiles — Role progression data
• activityLog — System audit trail

SQL Basics:
SQL lets you ask questions of the database:
• SELECT — Choose which columns to see
• FROM — Choose which table to query
• WHERE — Filter which rows to return
• ORDER BY — Sort the results
• GROUP BY — Aggregate rows together

Example:
SELECT callsign, cognitiveState FROM mirrors WHERE status = 'active'

This returns the callsign and cognitive state for all active mirrors. Practice in the SQL Lab to build your skills.`,
      type: "lecture",
      order: 1,
      durationMinutes: 25,
    },
    {
      title: "SELECT Fundamentals",
      content: `The SELECT statement is the foundation of SQL. It retrieves data from one or more tables.

BASIC SYNTAX:
SELECT column1, column2 FROM tableName;

SELECT ALL COLUMNS:
SELECT * FROM mirrors;
→ Returns every column for every row in the mirrors table

SELECT SPECIFIC COLUMNS:
SELECT callsign, cognitiveState FROM mirrors;
→ Returns only callsign and cognitiveState

COLUMN ALIASES:
SELECT callsign AS "Mirror Name", cognitiveState AS "State" FROM mirrors;
→ Renames columns in the output

DISTINCT VALUES:
SELECT DISTINCT cognitiveState FROM mirrors;
→ Returns unique values only (stable, strain, drift, critical)

EXPRESSIONS IN SELECT:
SELECT callsign, totalReflections, doctrineCompliance, 
       totalReflections * 2 AS "Weighted Score"
FROM mirrors;
→ You can perform calculations in SELECT

VIGIL PRACTICE QUERIES:
1. List all mirror callsigns:
   SELECT callsign FROM mirrors;

2. Show all doctrine articles with their section:
   SELECT title, section FROM doctrineArticles;

3. List all courses with difficulty:
   SELECT title, difficulty FROM courses;

4. Show evidence entries with severity:
   SELECT title, severity, status FROM evidenceEntries;

Try each of these in the SQL Lab challenge editor.`,
      type: "lecture",
      order: 2,
      durationMinutes: 20,
    },
    {
      title: "WHERE Clause & Filtering",
      content: `The WHERE clause filters rows based on conditions.

BASIC FILTERING:
SELECT * FROM mirrors WHERE status = 'active';
→ Only active mirrors

COMPARISON OPERATORS:
= equals
!= or <> not equals
> greater than
< less than
>= greater than or equal
<= less than or equal

EXAMPLES WITH VIGIL DATA:
SELECT * FROM mirrors WHERE cognitiveState = 'drift';
SELECT * FROM evidenceEntries WHERE severity = 'critical';
SELECT * FROM enrollments WHERE progress >= 75;
SELECT * FROM courses WHERE estimatedHours > 5;

COMBINING CONDITIONS:
AND — Both must be true:
SELECT * FROM evidenceEntries WHERE severity = 'critical' AND status = 'active';

OR — Either can be true:
SELECT * FROM mirrors WHERE cognitiveState = 'drift' OR cognitiveState = 'critical';

NOT — Negation:
SELECT * FROM mirrors WHERE NOT status = 'suspended';

IN — Match any value in a list:
SELECT * FROM mirrors WHERE cognitiveState IN ('drift', 'critical');

LIKE — Pattern matching:
SELECT * FROM doctrineArticles WHERE title LIKE '%Axiom%';
→ Finds all articles with "Axiom" in the title

BETWEEN — Range:
SELECT * FROM enrollments WHERE progress BETWEEN 50 AND 100;

NULL CHECKS:
SELECT * FROM mirrors WHERE lastReflection IS NULL;
SELECT * FROM mirrors WHERE lastReflection IS NOT NULL;`,
      type: "lecture",
      order: 3,
      durationMinutes: 25,
    },
    {
      title: "ORDER BY & LIMIT",
      content: `ORDER BY sorts your results. LIMIT restricts how many rows are returned.

ORDER BY:
SELECT callsign, cognitiveState FROM mirrors ORDER BY callsign;
→ Alphabetical by callsign

SELECT * FROM evidenceEntries ORDER BY createdAt DESC;
→ Newest first (DESC = descending)

MULTIPLE SORT COLUMNS:
SELECT * FROM mirrors ORDER BY cognitiveState ASC, callsign ASC;
→ First by state, then alphabetically within each state

LIMIT:
SELECT * FROM activityLog ORDER BY createdAt DESC LIMIT 10;
→ The 10 most recent activity entries

OFFSET (Skip rows):
SELECT * FROM activityLog ORDER BY createdAt DESC LIMIT 10 OFFSET 20;
→ Skip the first 20, then return 10 (for pagination)

VIGIL PRACTICE SCENARIOS:

1. "Show me the 5 most recent evidence entries":
SELECT * FROM evidenceEntries ORDER BY createdAt DESC LIMIT 5;

2. "List mirrors by doctrine compliance, lowest first":
SELECT callsign, doctrineCompliance FROM mirrors ORDER BY doctrineCompliance ASC;

3. "Find the 3 courses with the most lessons":
SELECT title, lessonsCount FROM courses ORDER BY lessonsCount DESC LIMIT 3;

4. "Show recent reflections for a specific mirror":
SELECT title, pillar, createdAt FROM reflections 
WHERE mirrorId = 'mirror_123' 
ORDER BY createdAt DESC 
LIMIT 20;`,
      type: "lecture",
      order: 4,
      durationMinutes: 20,
    },
    {
      title: "Aggregate Functions",
      content: `Aggregate functions perform calculations across multiple rows.

THE CORE AGGREGATES:
COUNT(*) — Number of rows
SUM(column) — Total of numeric column
AVG(column) — Average of numeric column
MIN(column) — Smallest value
MAX(column) — Largest value

EXAMPLES:

Count all mirrors:
SELECT COUNT(*) AS totalMirrors FROM mirrors;

Count active mirrors:
SELECT COUNT(*) AS activeMirrors FROM mirrors WHERE status = 'active';

Average doctrine compliance:
SELECT AVG(doctrineCompliance) AS avgCompliance FROM mirrors;

Total reflections across all mirrors:
SELECT SUM(totalReflections) AS allReflections FROM mirrors;

Highest and lowest compliance:
SELECT MAX(doctrineCompliance) AS highest, MIN(doctrineCompliance) AS lowest FROM mirrors;

VIGIL-SPECIFIC QUERIES:

1. "How many critical evidence entries exist?"
SELECT COUNT(*) FROM evidenceEntries WHERE severity = 'critical';

2. "What is the average course completion progress?"
SELECT AVG(progress) AS avgProgress FROM enrollments;

3. "How many reflections reference each pillar?"
SELECT pillar, COUNT(*) AS reflectionCount FROM reflections GROUP BY pillar;

4. "What is the total estimated hours across all courses?"
SELECT SUM(estimatedHours) AS totalHours FROM courses;

Aggregate functions are essential for reporting and system health monitoring.`,
      type: "lecture",
      order: 5,
      durationMinutes: 20,
    },
    {
      title: "GROUP BY & HAVING",
      content: `GROUP BY groups rows that share values. HAVING filters groups (like WHERE but for aggregated data).

GROUP BY:
SELECT cognitiveState, COUNT(*) AS mirrorCount 
FROM mirrors 
GROUP BY cognitiveState;

Result:
| cognitiveState | mirrorCount |
|---------------|-------------|
| stable        | 12          |
| strain        | 5           |
| drift         | 2           |
| critical      | 1           |

MULTIPLE GROUP COLUMNS:
SELECT section, priority, COUNT(*) 
FROM doctrineArticles 
GROUP BY section, priority;

HAVING (Filter Groups):
WHERE filters individual rows BEFORE grouping.
HAVING filters groups AFTER aggregation.

SELECT category, COUNT(*) AS entryCount 
FROM evidenceEntries 
GROUP BY category 
HAVING COUNT(*) > 3;
→ Only categories with more than 3 entries

VIGIL REPORTING QUERIES:

1. "Cognitive state distribution":
SELECT cognitiveState, COUNT(*) AS count FROM mirrors GROUP BY cognitiveState;

2. "Courses with more than 5 enrolled students":
SELECT courseId, COUNT(*) AS students FROM enrollments GROUP BY courseId HAVING COUNT(*) > 5;

3. "Evidence categories with critical items":
SELECT category, COUNT(*) AS criticalCount 
FROM evidenceEntries 
WHERE severity = 'critical' 
GROUP BY category 
HAVING COUNT(*) > 0
ORDER BY criticalCount DESC;

4. "Activity by module, last 30 days":
SELECT module, COUNT(*) AS actions 
FROM activityLog 
WHERE createdAt > (NOW() - INTERVAL 30 DAY) 
GROUP BY module 
ORDER BY actions DESC;`,
      type: "lecture",
      order: 6,
      durationMinutes: 25,
    },
    {
      title: "INNER JOIN",
      content: `JOIN combines rows from two or more tables based on a related column.

INNER JOIN returns only rows where there is a match in both tables.

SYNTAX:
SELECT columns 
FROM table1 
INNER JOIN table2 ON table1.column = table2.column;

EXAMPLE — Mirrors with User Names:
SELECT u.name, m.callsign, m.cognitiveState 
FROM users u 
INNER JOIN mirrors m ON u.id = m.userId;

→ Shows each user's name alongside their mirror callsign and state

EXAMPLE — Reflections with Mirror Callsigns:
SELECT m.callsign, r.title, r.pillar, r.createdAt 
FROM reflections r 
INNER JOIN mirrors m ON r.mirrorId = m.id;

→ Shows which mirror made each reflection

EXAMPLE — Enrollments with Course Details:
SELECT u.name, c.title, e.progress, e.status 
FROM enrollments e 
INNER JOIN users u ON e.userId = u.id 
INNER JOIN courses c ON e.courseId = c.id;

→ Three-table join: shows student name, course title, and progress

MULTIPLE JOINS:
You can join as many tables as needed:
SELECT u.name, m.callsign, r.title, r.pillar
FROM users u
INNER JOIN mirrors m ON u.id = m.userId
INNER JOIN reflections r ON m.id = r.mirrorId
WHERE r.pillar = 'fortitude';

→ Shows all fortitude-themed reflections with user and mirror context

Remember: INNER JOIN only returns rows with matches in BOTH tables. Users without mirrors will not appear.`,
      type: "lecture",
      order: 7,
      durationMinutes: 25,
    },
    {
      title: "LEFT/RIGHT JOIN",
      content: `LEFT JOIN and RIGHT JOIN return all rows from one table even when there's no match in the other.

LEFT JOIN — All Rows from Left Table:
SELECT u.name, m.callsign 
FROM users u 
LEFT JOIN mirrors m ON u.id = m.userId;

→ Returns ALL users, even those without mirrors (callsign will be NULL)

RIGHT JOIN — All Rows from Right Table:
SELECT u.name, m.callsign 
FROM users u 
RIGHT JOIN mirrors m ON u.id = m.userId;

→ Returns ALL mirrors, even if the user record is missing

FINDING MISSING DATA:
Users WITHOUT mirrors:
SELECT u.name, u.email 
FROM users u 
LEFT JOIN mirrors m ON u.id = m.userId 
WHERE m.id IS NULL;

→ The IS NULL check on the joined table finds unmatched rows

VIGIL USE CASES:

1. "Students not enrolled in any course":
SELECT u.name 
FROM users u 
LEFT JOIN enrollments e ON u.id = e.userId 
WHERE e.id IS NULL;

2. "Courses with no enrollments":
SELECT c.title 
FROM courses c 
LEFT JOIN enrollments e ON c.id = e.courseId 
WHERE e.id IS NULL;

3. "All users with their mirror status (including those without mirrors)":
SELECT u.name, u.email, 
       COALESCE(m.cognitiveState, 'no mirror') AS state
FROM users u 
LEFT JOIN mirrors m ON u.id = m.userId;

COALESCE replaces NULL with a default value — useful for LEFT JOIN results.`,
      type: "lecture",
      order: 8,
      durationMinutes: 25,
    },
    {
      title: "Subqueries",
      content: `A subquery is a query inside another query. It lets you build complex questions step by step.

SUBQUERY IN WHERE:
"Find mirrors with above-average doctrine compliance":
SELECT callsign, doctrineCompliance 
FROM mirrors 
WHERE doctrineCompliance > (SELECT AVG(doctrineCompliance) FROM mirrors);

SUBQUERY IN FROM:
"Average reflections per mirror":
SELECT AVG(reflectionCount) AS avgReflections 
FROM (
  SELECT mirrorId, COUNT(*) AS reflectionCount 
  FROM reflections 
  GROUP BY mirrorId
) AS mirrorCounts;

SUBQUERY WITH IN:
"Users enrolled in the SELF Doctrine Foundations course":
SELECT name FROM users 
WHERE id IN (
  SELECT userId FROM enrollments 
  WHERE courseId = (
    SELECT id FROM courses WHERE title = 'SELF Doctrine Foundations'
  )
);

EXISTS:
"Mirrors that have at least one drift-state reflection":
SELECT m.callsign FROM mirrors m 
WHERE EXISTS (
  SELECT 1 FROM reflections r 
  WHERE r.mirrorId = m.id AND r.cognitiveState = 'drift'
);

VIGIL-SPECIFIC SUBQUERIES:

1. "Courses more popular than average":
SELECT title FROM courses 
WHERE id IN (
  SELECT courseId FROM enrollments 
  GROUP BY courseId 
  HAVING COUNT(*) > (
    SELECT AVG(cnt) FROM (
      SELECT COUNT(*) AS cnt FROM enrollments GROUP BY courseId
    ) AS avg_enrollments
  )
);

2. "Evidence entries created by users currently in drift":
SELECT e.title, e.severity FROM evidenceEntries e 
WHERE e.createdBy IN (
  SELECT userId FROM mirrors WHERE cognitiveState = 'drift'
);`,
      type: "lecture",
      order: 9,
      durationMinutes: 30,
    },
    {
      title: "INSERT & UPDATE Statements",
      content: `INSERT adds new rows. UPDATE modifies existing rows.

INSERT — Add New Data:
INSERT INTO evidenceEntries (title, description, category, severity, status, source, createdBy, createdAt, updatedAt)
VALUES ('Axiom compliance verified', 'Quarterly doctrine check passed', 'doctrine', 'low', 'validated', 'system_audit', 'user_123', NOW(), NOW());

INSERT MULTIPLE ROWS:
INSERT INTO activityLog (userId, action, module, createdAt) VALUES
('user_1', 'Course enrolled', 'academy', NOW()),
('user_1', 'Reflection added', 'mirror', NOW()),
('user_2', 'Evidence created', 'evidence', NOW());

UPDATE — Modify Existing Data:
UPDATE mirrors SET cognitiveState = 'stable' WHERE id = 'mirror_123';

UPDATE WITH CONDITIONS:
UPDATE enrollments SET status = 'completed', progress = 100, completedAt = NOW()
WHERE userId = 'user_123' AND courseId = 'course_456' AND progress >= 95;

IMPORTANT — UPDATE SAFETY:
ALWAYS use a WHERE clause with UPDATE. Without it, you update EVERY row:
UPDATE mirrors SET status = 'suspended';  ← This suspends ALL mirrors!

VIGIL CONSIDERATIONS:
• The continuity chain is append-only — you INSERT reflections, never UPDATE them
• Evidence entries can be updated in status (active → validated) but content should not change (chain of custody)
• Mirror cognitive state is updated by the pipeline, not manually
• Activity log is append-only — entries are never modified

SAFE PRACTICE:
Before running UPDATE, first SELECT with the same WHERE clause to verify which rows will be affected:
SELECT * FROM enrollments WHERE userId = 'user_123' AND courseId = 'course_456';
→ Verify this is the right data BEFORE updating`,
      type: "lecture",
      order: 10,
      durationMinutes: 25,
    },
    {
      title: "CREATE TABLE & Schema Design",
      content: `CREATE TABLE defines new tables. Schema design determines how data is organized.

CREATE TABLE:
CREATE TABLE training_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  sessionType TEXT NOT NULL,
  durationMinutes INTEGER DEFAULT 0,
  score REAL DEFAULT 0.0,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DATA TYPES:
• TEXT / VARCHAR — Strings
• INTEGER — Whole numbers
• REAL / FLOAT — Decimal numbers
• BOOLEAN — True/False
• TIMESTAMP — Date and time
• BLOB — Binary data

CONSTRAINTS:
• PRIMARY KEY — Unique identifier for each row
• NOT NULL — Column cannot be empty
• UNIQUE — No duplicate values
• DEFAULT — Default value if none provided
• FOREIGN KEY — References another table
• CHECK — Custom validation

FOREIGN KEYS (Relationships):
CREATE TABLE reflections (
  id INTEGER PRIMARY KEY,
  mirrorId INTEGER NOT NULL,
  content TEXT NOT NULL,
  pillar TEXT NOT NULL,
  FOREIGN KEY (mirrorId) REFERENCES mirrors(id)
);

VIGIL SCHEMA DESIGN PRINCIPLES:
• Per-user isolation: user IDs are present in every table (Cardinal Axiom enforcement)
• Timestamps on everything: createdAt, updatedAt for auditability
• Immutable audit trails: activityLog and reflections are append-only
• Enum-like constraints: cognitive states, roles, and categories use strict value sets
• Indexed columns: userId, mirrorId, courseId for query performance

INDEXES:
CREATE INDEX idx_mirrors_userId ON mirrors(userId);
CREATE INDEX idx_reflections_mirrorId ON reflections(mirrorId);

Indexes speed up queries on frequently filtered columns.`,
      type: "lecture",
      order: 11,
      durationMinutes: 30,
    },
    {
      title: "VIGIL-Specific: Mirror & Doctrine Queries",
      content: `This lab focuses on SQL queries specific to VIGIL's Mirror and Doctrine systems.

MIRROR QUERIES:

1. Mirror status dashboard:
SELECT 
  COUNT(*) AS total,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
  SUM(CASE WHEN status = 'dormant' THEN 1 ELSE 0 END) AS dormant,
  SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended,
  AVG(doctrineCompliance) AS avgCompliance
FROM mirrors;

2. Cognitive state breakdown with percentages:
SELECT 
  cognitiveState,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM mirrors), 1) AS percentage
FROM mirrors 
GROUP BY cognitiveState;

3. Mirrors with declining compliance (below threshold):
SELECT callsign, doctrineCompliance, totalReflections 
FROM mirrors 
WHERE doctrineCompliance < 70 AND status = 'active'
ORDER BY doctrineCompliance ASC;

DOCTRINE QUERIES:

4. All axioms with priority:
SELECT title, priority FROM doctrineArticles 
WHERE section = 'axiom' 
ORDER BY priority DESC;

5. SELF pillar coverage:
SELECT section, COUNT(*) AS articles 
FROM doctrineArticles 
WHERE section != 'axiom' 
GROUP BY section;

6. Active doctrine by version:
SELECT version, COUNT(*) AS articleCount 
FROM doctrineArticles 
WHERE isActive = true 
GROUP BY version;

EVIDENCE CHAIN QUERIES:

7. Evidence integrity report:
SELECT category, 
  COUNT(*) AS total,
  SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) AS validated,
  SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical
FROM evidenceEntries 
GROUP BY category;

Practice these in the SQL Lab to build operational competency.`,
      type: "lab",
      order: 12,
      durationMinutes: 35,
    },
    {
      title: "VIGIL-Specific: Enrollment Reporting",
      content: `This lab covers enrollment, certification, and progress reporting queries.

ENROLLMENT REPORTING:

1. Course enrollment summary:
SELECT c.title, c.difficulty,
  COUNT(e.id) AS enrolled,
  AVG(e.progress) AS avgProgress,
  SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS completed
FROM courses c 
LEFT JOIN enrollments e ON c.id = e.courseId 
GROUP BY c.id, c.title, c.difficulty 
ORDER BY enrolled DESC;

2. Student progress report:
SELECT u.name, c.title, e.progress, e.status, e.enrolledAt 
FROM enrollments e 
JOIN users u ON e.userId = u.id 
JOIN courses c ON e.courseId = c.id 
ORDER BY u.name, e.progress DESC;

3. Students who completed all courses:
SELECT u.name, COUNT(e.id) AS completed 
FROM users u 
JOIN enrollments e ON u.id = e.userId 
WHERE e.status IN ('completed', 'certified') 
GROUP BY u.id, u.name 
HAVING COUNT(e.id) = (SELECT COUNT(*) FROM courses WHERE isPublished = true);

ROLE PROGRESSION REPORTING:

4. Role distribution:
SELECT role, COUNT(*) AS userCount 
FROM userProfiles 
GROUP BY role 
ORDER BY CASE role 
  WHEN 'operator' THEN 1 
  WHEN 'certified' THEN 2 
  WHEN 'admin' THEN 3 
  WHEN 'superadmin' THEN 4 
  WHEN 'founder' THEN 5 
END;

5. Certification pipeline (students close to role promotion):
SELECT u.name, p.role, 
  COUNT(e.id) AS completedCourses,
  (SELECT COUNT(*) FROM courses WHERE isPublished = true) AS totalCourses
FROM users u 
JOIN userProfiles p ON u.id = p.userId 
JOIN enrollments e ON u.id = e.userId 
WHERE e.status = 'completed' 
GROUP BY u.id, u.name, p.role;

These queries power the Administration dashboard and certification tracking systems.`,
      type: "lab",
      order: 13,
      durationMinutes: 35,
    },
    {
      title: "Advanced SQL Patterns",
      content: `This lesson covers advanced SQL patterns relevant to VIGIL data analysis.

WINDOW FUNCTIONS:
Track trends over time without GROUP BY:
SELECT callsign, createdAt, doctrineCompliance,
  AVG(doctrineCompliance) OVER (ORDER BY createdAt ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS movingAvg
FROM mirrors;

CASE EXPRESSIONS:
Categorize data inline:
SELECT callsign,
  CASE cognitiveState
    WHEN 'stable' THEN 'Operational'
    WHEN 'strain' THEN 'Monitoring'
    WHEN 'drift' THEN 'Attention Required'
    WHEN 'critical' THEN 'Immediate Response'
  END AS stateCategory
FROM mirrors;

COMMON TABLE EXPRESSIONS (CTEs):
WITH active_mirrors AS (
  SELECT * FROM mirrors WHERE status = 'active'
),
drift_mirrors AS (
  SELECT * FROM active_mirrors WHERE cognitiveState IN ('drift', 'critical')
)
SELECT callsign, cognitiveState FROM drift_mirrors;

SELF-JOIN:
Find users enrolled in the same courses:
SELECT DISTINCT e1.userId AS user1, e2.userId AS user2, c.title
FROM enrollments e1 
JOIN enrollments e2 ON e1.courseId = e2.courseId AND e1.userId < e2.userId
JOIN courses c ON e1.courseId = c.id;

UNION:
Combine activity from multiple tables:
SELECT 'reflection' AS type, title, createdAt FROM reflections WHERE userId = 'user_123'
UNION ALL
SELECT 'evidence' AS type, title, createdAt FROM evidenceEntries WHERE createdBy = 'user_123'
ORDER BY createdAt DESC;

These patterns are essential for building comprehensive VIGIL operational reports.`,
      type: "lecture",
      order: 14,
      durationMinutes: 30,
    },
    {
      title: "SQL Training Lab Assessment",
      content: `Final assessment for the SQL Training Lab course.

CHALLENGE 1 — Mirror Health Report (Beginner)
Write a query that returns:
• Total mirrors, active mirrors, average doctrine compliance, mirrors in drift or critical

Expected:
SELECT COUNT(*) AS total,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
  ROUND(AVG(doctrineCompliance), 1) AS avgCompliance,
  SUM(CASE WHEN cognitiveState IN ('drift', 'critical') THEN 1 ELSE 0 END) AS needsAttention
FROM mirrors;

CHALLENGE 2 — Student Progress Matrix (Intermediate)
Write a query showing each student's name, number of courses enrolled, courses completed, and average progress.

Expected:
SELECT u.name,
  COUNT(e.id) AS enrolled,
  SUM(CASE WHEN e.status IN ('completed', 'certified') THEN 1 ELSE 0 END) AS completed,
  ROUND(AVG(e.progress), 0) AS avgProgress
FROM users u 
JOIN enrollments e ON u.id = e.userId 
GROUP BY u.id, u.name 
ORDER BY avgProgress DESC;

CHALLENGE 3 — Evidence Integrity Audit (Advanced)
Write a query that identifies evidence categories where more than 20% of entries are critical severity and still active.

Expected:
SELECT category,
  COUNT(*) AS total,
  SUM(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 ELSE 0 END) AS criticalActive,
  ROUND(SUM(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS criticalPct
FROM evidenceEntries 
GROUP BY category 
HAVING criticalPct > 20
ORDER BY criticalPct DESC;

Review your solutions for accuracy before submission.`,
      type: "assessment",
      order: 15,
      durationMinutes: 40,
    },
  ],

  // ═══════════════════════════════════════
  // COURSE 5: INFRASTRUCTURE ADMINISTRATION
  // ═══════════════════════════════════════
  "Infrastructure Administration": [
    {
      title: "VIGIL Infrastructure Overview",
      content: `VIGIL's infrastructure must enforce the Immutable Axioms at every layer — from network to application to storage.

Architecture Components:
• Application Servers — Run the VIGIL platform (Node.js, React)
• Database Layer — Convex real-time database (or equivalent)
• Authentication — Identity verification and session management
• Storage — Per-user encrypted data stores
• Networking — Segmented networks for production/training isolation
• Monitoring — System health without privacy violation
• CDN/Edge — Content delivery and DDoS protection (Cloudflare)

Azure Integration Points:
• Azure OpenAI — AI response generation (Stage 9 of Cognitive Loop)
• Azure AI Search — Pattern recognition data indexing
• Azure Key Vault — Secret and encryption key management
• Azure Blob Storage — Encrypted file storage per user
• Azure Monitor — Infrastructure health telemetry (NOT user data)

Cardinal Axiom at Infrastructure Level:
The Cardinal Axiom ("Knowledge flows down, never up") has infrastructure implications:
• Database: Per-user row-level security or separate schemas
• Networking: No shared data paths between user contexts
• Caching: No shared caches that could leak cross-user data
• Logging: Infrastructure logs must not contain user content
• Monitoring: System metrics only — no behavioral data

Infrastructure administration is one of the most technically demanding roles in VIGIL because every architectural decision must be evaluated against the axioms.`,
      type: "lecture",
      order: 1,
      durationMinutes: 30,
    },
    {
      title: "Server Provisioning & Deployment",
      content: `This lesson covers the process of provisioning and deploying VIGIL application servers.

Server Requirements:
• OS: Ubuntu 22.04 LTS (or equivalent hardened Linux)
• Runtime: Node.js 20 LTS
• Process Manager: PM2 (process persistence and monitoring)
• Reverse Proxy: Nginx (SSL termination, request routing)
• Firewall: UFW (Uncomplicated Firewall)

Deployment Steps:

1. PROVISION
• Create VM (Azure VM, AWS EC2, or bare metal)
• Minimum: 2 vCPU, 4GB RAM, 50GB SSD
• Assign static IP and DNS record

2. HARDEN
• Disable root SSH login
• Create service account with sudo access
• Configure SSH key-only authentication
• Install and configure fail2ban (brute force protection)
• Enable UFW: allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

3. INSTALL DEPENDENCIES
• curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
• sudo apt-get install -y nodejs nginx
• sudo npm install -g pm2

4. DEPLOY APPLICATION
• Clone repository to /opt/vigil
• npm ci --production
• Configure environment variables (NEVER hardcode secrets)
• pm2 start ecosystem.config.js

5. CONFIGURE NGINX
• Set up reverse proxy: proxy_pass http://localhost:3000
• Install SSL certificate (Let's Encrypt / certbot)
• Configure security headers (HSTS, CSP, X-Frame-Options)

6. VERIFY
• HTTPS accessible
• Application responding
• Firewall rules correct
• Fail2ban active
• PM2 restart policy configured`,
      type: "lecture",
      order: 2,
      durationMinutes: 35,
    },
    {
      title: "Network Architecture & Segmentation",
      content: `Network segmentation is critical for enforcing Mirror Isolation — training environments must never touch production data.

Network Design Principles:

1. PRODUCTION NETWORK
• Contains: Production application servers, production database
• Access: Authenticated users via HTTPS only
• Internal: Only production services can communicate
• No cross-network access from training

2. TRAINING NETWORK
• Contains: Training application servers, training database (synthetic data only)
• Access: Authenticated users via HTTPS only
• Internal: Completely isolated from production
• Prefixed mirrors (TRN-) enforced at data layer

3. MANAGEMENT NETWORK
• Contains: Monitoring, logging, backup infrastructure
• Access: Administrators only, via VPN
• Receives infrastructure metrics (NOT user data) from both networks

Implementation (Azure VNet Example):
• VNet: 10.0.0.0/16
  • Production Subnet: 10.0.1.0/24
  • Training Subnet: 10.0.2.0/24
  • Management Subnet: 10.0.3.0/24

Network Security Groups (NSGs):
• Production NSG: Block all inbound from Training Subnet
• Training NSG: Block all inbound from Production Subnet
• Management NSG: Allow inbound from both (monitoring only)

DNS Segmentation:
• vigil.example.com → Production
• training.vigil.example.com → Training
• admin.vigil.example.com → Management (VPN required)

Testing Isolation:
After configuration, verify:
• Training server cannot ping production server
• Training server cannot access production database
• Training DNS does not resolve to production IPs
• Data flowing between subnets is blocked and logged`,
      type: "lecture",
      order: 3,
      durationMinutes: 30,
    },
    {
      title: "Identity & Access Management",
      content: `VIGIL's role system (Operator → Certified → Admin → Superadmin → Founder) must be enforced at the infrastructure level.

Role-Based Access Control (RBAC):
• Operator: Application access only (Mirror, Doctrine, Academy)
• Certified: Application access + certification features
• Admin: Application access + user management + reporting
• Superadmin: Full application access + system configuration
• Founder: Full access + doctrine modification + role management

Infrastructure Access Levels:
• Operators/Certified: No infrastructure access
• Admin: Read-only monitoring dashboards
• Superadmin: Server access via SSH (audited)
• Founder: Full infrastructure access

Authentication Requirements:
• All users: Email/password with OTP verification
• Admin+: Multi-factor authentication required
• Infrastructure: SSH key-only (no passwords)
• API access: Short-lived tokens (max 1 hour)

Azure AD Integration:
1. Register VIGIL as Enterprise Application
2. Map VIGIL roles to Azure AD groups
3. Configure Conditional Access policies
4. Enable MFA for admin-tier groups
5. Configure sign-in risk policies

Secret Management:
• NEVER store secrets in code, environment files, or repositories
• Use Azure Key Vault for all secrets (API keys, database credentials, encryption keys)
• Rotate secrets on a scheduled basis (90 days for standard, 30 days for critical)
• Audit all secret access

Principle of Least Privilege:
Every account, service, and process should have the minimum permissions required. This applies to:
• User accounts (role-based)
• Service accounts (scoped to specific services)
• Database access (row-level security where possible)
• API permissions (scoped to specific endpoints)`,
      type: "lecture",
      order: 4,
      durationMinutes: 30,
    },
    {
      title: "SSL/TLS & Encryption",
      content: `Encryption protects data in transit and at rest. For VIGIL, encryption is a Cardinal Axiom requirement — user data must be protected at every layer.

DATA IN TRANSIT:
• All HTTP traffic must use TLS 1.3 (minimum TLS 1.2)
• HSTS headers enforce HTTPS (Strict-Transport-Security: max-age=31536000)
• Certificate management via Let's Encrypt (auto-renewal) or Azure-managed certs
• Internal service communication: mTLS (mutual TLS) between services

Nginx SSL Configuration:
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

DATA AT REST:
• Database encryption: AES-256 encryption for all stored data
• File storage: Azure Blob Storage with customer-managed keys
• Backup encryption: All backups encrypted before storage
• Key management: Azure Key Vault with HSM-backed keys

PER-USER ENCRYPTION (Cardinal Axiom):
For maximum Cardinal Axiom compliance, consider:
• Per-user encryption keys stored in Key Vault
• User data encrypted with their individual key
• Key access restricted to the user's authenticated session
• Even database administrators cannot read plaintext user data

This is the strongest form of Cardinal Axiom enforcement at the infrastructure level — even with database access, cross-user data reading is cryptographically prevented.

Certificate Lifecycle:
1. Generate: Let's Encrypt or CA-issued
2. Deploy: Automated via certbot or Azure
3. Monitor: Alert 30 days before expiry
4. Rotate: Automated renewal
5. Revoke: Immediate revocation capability for compromised certs`,
      type: "lecture",
      order: 5,
      durationMinutes: 25,
    },
    {
      title: "Backup & Disaster Recovery",
      content: `VIGIL's Continuity Axiom has direct infrastructure implications: the continuity chain must survive any disaster.

Backup Strategy:

1. DATA CLASSIFICATION (by Continuity Axiom priority):
• CRITICAL: Continuity chains (reflections, mirror data) — RPO: 1 hour
• HIGH: User profiles, enrollments, certifications — RPO: 4 hours
• STANDARD: Doctrine articles, course content — RPO: 24 hours
• LOW: Activity logs, system configuration — RPO: 24 hours

(RPO = Recovery Point Objective: maximum acceptable data loss)

2. BACKUP SCHEDULE:
• Continuous: Real-time replication of critical data
• Every 4 hours: Incremental backup of high-priority data
• Daily: Full backup of all data (midnight UTC)
• Weekly: Full system image (including configuration)
• Monthly: Archive to cold storage (geo-redundant)

3. STORAGE:
• Primary backups: Same region, different availability zone
• Secondary backups: Different region (geo-redundant)
• Archive: Azure Cool/Archive storage (cost-effective long-term)

4. ENCRYPTION:
All backups encrypted with AES-256 before storage.
Backup encryption keys stored separately from backup data.

DISASTER RECOVERY PLAN:
• RTO (Recovery Time Objective): 4 hours for critical systems
• RPO: As defined above per data classification
• Failover: Automated failover to secondary region
• Communication: Status page update within 15 minutes of incident
• Testing: DR test quarterly (simulate full failover)

DR TEST PROCEDURE:
1. Notify team of planned DR test
2. Simulate primary region failure
3. Initiate failover to secondary region
4. Verify all critical data is accessible and current
5. Verify continuity chains are intact (no gaps, no corruption)
6. Run automated integrity checks
7. Document results and restore primary
8. Update DR plan based on findings`,
      type: "lecture",
      order: 6,
      durationMinutes: 30,
    },
    {
      title: "Monitoring & Alerting",
      content: `Monitoring VIGIL systems must balance visibility with the Cardinal Axiom — you need to know if the system is healthy without accessing user data.

WHAT TO MONITOR (Safe — Infrastructure Metrics):
✅ CPU, memory, disk usage per server
✅ Request count, response times, error rates
✅ Database query performance
✅ SSL certificate expiry dates
✅ Backup job success/failure
✅ Service uptime and availability
✅ Network throughput between subnets

WHAT NOT TO MONITOR (Violates Cardinal Axiom):
✗ User engagement frequency
✗ Reflection content or themes
✗ Individual cognitive state distributions
✗ User session duration or behavior patterns
✗ Content of any user-generated data

AGGREGATE EXCEPTIONS:
Some aggregate metrics are acceptable IF they cannot identify individuals:
• Total active mirrors (count only, no identifiers)
• System-wide cognitive state distribution (only if user count is large enough to prevent identification)
• Total reflections per day (volume metric, no content)

Monitoring Stack:
• Metrics: Azure Monitor or Prometheus + Grafana
• Logs: Azure Log Analytics or ELK Stack
• Alerts: PagerDuty or Azure Alerts
• Status Page: Public status page for users

Alert Rules:
• CRITICAL: Service down, database unreachable, backup failure
• HIGH: CPU > 85% for 10 minutes, error rate > 5%, disk > 90%
• MEDIUM: Response time > 2s p95, certificate expiring in 14 days
• LOW: Disk > 75%, minor service degradation

Log Hygiene:
Infrastructure logs MUST be scrubbed of user content:
• Request logs: URL paths only, no query parameters with user data
• Error logs: Stack traces without user input
• Database logs: Query performance only, not query content
• Application logs: Event types only, not event details`,
      type: "lecture",
      order: 7,
      durationMinutes: 25,
    },
    {
      title: "Security Hardening",
      content: `Security hardening ensures the VIGIL platform resists unauthorized access, data exfiltration, and system compromise.

SERVER HARDENING CHECKLIST:
□ Disable root login
□ SSH key-only authentication
□ Fail2ban configured (5 attempts, 1-hour ban)
□ UFW active (only required ports open)
□ Automatic security updates enabled
□ Non-essential services disabled
□ File system permissions restricted (principle of least privilege)

APPLICATION HARDENING:
□ All dependencies audited (npm audit / Snyk)
□ Content Security Policy (CSP) headers configured
□ X-Frame-Options: DENY
□ X-Content-Type-Options: nosniff
□ Rate limiting on all API endpoints
□ Input validation and sanitization
□ SQL injection prevention (parameterized queries)
□ XSS prevention (output encoding)
□ CSRF tokens on all state-changing requests

DATABASE HARDENING:
□ Default credentials changed
□ Network access restricted (internal only)
□ Row-level security enabled where possible
□ Encrypted connections required
□ Query logging enabled (performance only, not content)
□ Regular backups verified

NETWORK HARDENING:
□ Production/training isolation verified
□ Internal services not exposed to public internet
□ WAF (Web Application Firewall) active
□ DDoS protection enabled (Cloudflare or Azure DDoS)
□ VPN required for administrative access

VIGIL-SPECIFIC SECURITY:
□ Per-user engine isolation verified
□ Cross-user data access impossible at every layer
□ No telemetry or tracking code
□ No third-party analytics
□ No external service has access to user data
□ Audit trail immutable and append-only

Regular security audits (quarterly) should verify every item on this checklist.`,
      type: "lecture",
      order: 8,
      durationMinutes: 25,
    },
    {
      title: "Azure Integration for VIGIL",
      content: `VIGIL leverages Azure services for AI capabilities, secret management, and storage. Each integration must comply with the Immutable Axioms.

AZURE OPENAI:
Purpose: Powers Stage 9 (AI Response) of the Cognitive Loop Pipeline
Configuration:
• Deployed in the same region as the VIGIL application
• API key stored in Azure Key Vault (never in code)
• Request/response logs disabled (Cardinal Axiom)
• No data stored by Azure OpenAI (data processing agreement required)
• Per-user context isolation in prompts

AZURE KEY VAULT:
Purpose: Centralized secret and key management
Stores:
• Database connection strings
• API keys (OpenAI, third-party services)
• Encryption keys (per-user if applicable)
• SSL certificate private keys
Access:
• Managed Identity for services (no credentials in code)
• Access policies scoped to specific services
• Audit logging of all key access

AZURE BLOB STORAGE:
Purpose: Encrypted file storage
Configuration:
• Per-user containers or prefix-based isolation
• Customer-managed encryption keys (via Key Vault)
• Immutable storage policies for evidence chain data
• Lifecycle management (hot → cool → archive)
• Geo-redundant storage (RA-GRS) for disaster recovery

AZURE MONITOR:
Purpose: Infrastructure health monitoring
Configuration:
• Collect: CPU, memory, disk, network metrics
• Do NOT collect: Application-level user data
• Alerts: Route to operations team
• Dashboards: Infrastructure health only
• Log Analytics: Infrastructure logs only (scrubbed of user content)

CLOUDFLARE:
Purpose: CDN, DDoS protection, DNS management
Configuration:
• DNS: Proxy production and training domains
• SSL: Full (strict) encryption mode
• WAF: OWASP rule set enabled
• Rate limiting: Configure per-endpoint
• Cache: Static assets only (never cache user data)`,
      type: "lecture",
      order: 9,
      durationMinutes: 30,
    },
    {
      title: "Infrastructure Assessment",
      content: `Final assessment for the Infrastructure Administration course.

SCENARIO 1 — INCIDENT RESPONSE
The monitoring system shows database CPU at 95% for 15 minutes. Error rate is rising.

Your response:
1. Check which queries are consuming resources (query performance logs — not content)
2. Identify if the load is from a specific service or user volume
3. Scale database resources if needed (vertical or horizontal)
4. If caused by a specific query pattern, optimize indexes
5. Document incident in operations log (no user data in documentation)
6. Post-incident: Review monitoring thresholds and scaling policies

SCENARIO 2 — SECURITY AUDIT
During a quarterly audit, you discover that the application error log contains user reflection content in stack traces.

Your response:
1. This is a Cardinal Axiom violation — user content should never appear in system logs
2. Immediately: Purge the affected log entries
3. Fix: Sanitize error handling to exclude user content from stack traces
4. Verify: Audit all logging paths for similar issues
5. Document: Record the violation, fix, and prevention measures
6. Notify: Inform the Founder of the violation and remediation

SCENARIO 3 — NETWORK ISOLATION TEST
Design a test plan to verify training/production network isolation:
1. From training subnet: attempt to reach production database port → Should be blocked
2. From training subnet: attempt DNS resolution of production hostnames → Should fail or resolve to training
3. From production API: attempt to access training data tables → Should be denied
4. Cross-check: verify no shared credentials between environments
5. Document all test results with timestamps

SCENARIO 4 — BACKUP VERIFICATION
Write the steps to verify backup integrity for continuity chain data:
1. Select a recent backup
2. Restore to isolated test environment
3. Compare record counts with production
4. Verify chain integrity (sequential positions, no gaps)
5. Verify encryption (data readable only with correct keys)
6. Document verification results
7. Destroy test environment after verification`,
      type: "assessment",
      order: 10,
      durationMinutes: 45,
    },
  ],

  // ═══════════════════════════════════════
  // COURSE 6: VIGIL OPERATOR CERTIFICATION
  // ═══════════════════════════════════════
  "VIGIL Operator Certification": [
    {
      title: "Certification Program Overview",
      content: `The VIGIL Operator Certification program verifies comprehensive mastery of the VIGIL platform. Certification is required for access to administrative functions and instructor roles.

Certification Path:
1. Complete all prerequisite courses:
   • SELF Doctrine Foundations
   • Continuity Anchor Mirror™ Operations
   • The Cognitive Loop Pipeline
   • SQL Training Lab
   • Infrastructure Administration

2. Pass all course assessments with 80% or higher

3. Complete practical evaluations:
   • Mirror operations scenario (graded by instructor)
   • Doctrine compliance audit (graded by instructor)
   • SQL competency demonstration
   • Infrastructure security review

4. Pass the VIGIL Operator Certification Exam (comprehensive, 75% minimum)

5. Annual recertification required to maintain active status

What Certification Proves:
• Mastery of the SELF Doctrine and all six pillars
• Understanding of all five Immutable Axioms and their operational implications
• Ability to operate and understand the Continuity Anchor Mirror™
• Knowledge of the 13-stage Cognitive Loop Pipeline
• SQL competency against VIGIL database schemas
• Infrastructure administration capability
• Commitment to doctrine compliance and veteran sovereignty

Certification Levels:
• VIGIL Operator — Standard certification, required for admin access
• VIGIL Instructor — Advanced certification, can create courses and grade students
• VIGIL Administrator — Full system access certification`,
      type: "lecture",
      order: 1,
      durationMinutes: 20,
    },
    {
      title: "Axiom Mastery: Sovereignty",
      content: `Deep mastery of the Sovereignty Axiom — "The user is sovereign."

This lesson goes beyond understanding to operational mastery. You must be able to identify sovereignty violations in complex, ambiguous scenarios.

OBVIOUS VIOLATIONS:
• System prescribes actions
• System restricts user access based on state
• System makes decisions on behalf of the user

SUBTLE VIOLATIONS (These are harder to catch):

1. Gamification that incentivizes specific behaviors
"Complete 3 reflections this week to earn a badge" — This directs behavior. The system should not incentivize engagement frequency or type.

2. Progress framing that implies correct paths
"You're 60% through your recovery journey" — This frames the user's experience as a "journey" with a destination. The user's experience is sovereign — it is not a path to a predetermined outcome.

3. Comparison, even implicit
"Most users in your state find reflections helpful" — This implies a norm. The user's experience is not measured against others.

4. Default settings that assume preferences
Pre-selecting notification frequencies or engagement reminders assumes the user wants to be contacted. Defaults should be minimal; users opt in.

5. Language that implies system authority
"Your mirror recommends..." — The mirror does not recommend. It reflects. Recommendation implies authority and direction.

CERTIFICATION-LEVEL QUESTION:
A feature allows users to set goals within the platform. Is this compliant?
→ YES, if the user creates their own goals without system prompting
→ NO, if the system suggests goals or measures progress toward them
→ BORDERLINE if the system tracks goal completion — tracking implies evaluation`,
      type: "lecture",
      order: 2,
      durationMinutes: 25,
    },
    {
      title: "Axiom Mastery: No Probing",
      content: `Deep mastery of the No Probing Axiom — "VIGIL does not probe, interrogate, or seek information the user has not freely offered."

OBVIOUS VIOLATIONS:
• Asking follow-up questions about disclosed content
• Requesting elaboration on a topic
• Prompting the user to share more

SUBTLE VIOLATIONS:

1. Structured prompts
"Today's reflection topic: What challenges did you face this week?" — This directs the user to think about a specific topic. Even optional prompts are probing if they steer attention.

2. Template-based engagement
"Fill in: Today I feel _____" — Templates probe by constraining expression to system-defined categories.

3. Follow-up acknowledgments that implicitly ask for more
"That sounds significant." — While this doesn't ask a question, it signals that the system found the content "significant," which can pressure the user to elaborate.

4. Contextual references to past content
"Last time you mentioned your family..." — This references past content in a way that invites the user to continue that thread. The user may reference their own past content; the system should not.

5. Silence design
Using silence or delayed response to create conversational pressure to share more. The system should respond consistently regardless of content depth.

COMPLIANT ALTERNATIVES:
• Open-ended, unprompted reflection space
• No topic suggestions, no templates
• Acknowledgment without evaluation: "Recorded" or "Added to your chain"
• System responds to what is given; never steers toward what is not

CERTIFICATION-LEVEL QUESTION:
The system detects a user hasn't engaged in 14 days. Can it send a check-in message?
→ NO. A check-in is probing — it seeks engagement the user has not offered. The system remains present and available; it does not reach out.`,
      type: "lecture",
      order: 3,
      durationMinutes: 25,
    },
    {
      title: "Axiom Mastery: No Override",
      content: `Deep mastery of the No Override Axiom — "The user's expressed state, identity, and decisions cannot be overridden by the system."

OBVIOUS VIOLATIONS:
• System contradicts user's self-assessment
• System reclassifies expressed state based on patterns
• System overrides user decisions with safety measures

SUBTLE VIOLATIONS:

1. Implicit disagreement through behavior change
The user says "I'm fine" but the system shifts to Interrupt mode visibly. Even if the system internally classifies as drift, user-facing behavior must not signal disagreement with "I'm fine."

2. Pattern-based recommendations
"Your patterns suggest you might benefit from..." — This uses the system's analysis to override the user's implicit decision not to seek help.

3. Safety override temptation
When a user is in Critical state, the instinct is to override sovereignty for safety. VIGIL does NOT do this. Anchor Recall presents the user's own anchors — it does not take protective action.

4. Feature restrictions based on state
Disabling certain features during drift or critical states "for the user's protection" is an override. All features remain available regardless of state.

5. Interpretive responses
"It sounds like you're struggling with..." — This interprets the user's expression. Interpretation is a form of override because it replaces the user's words with the system's analysis.

THE HARDEST QUESTION IN VIGIL DESIGN:
What if the system's pattern recognition strongly suggests a user is in crisis, but the user says they are fine?

Answer: The user is fine. The system maintains its internal classification for response mode selection, but it NEVER communicates this classification to the user or takes external action based on it. The axiom is non-negotiable.`,
      type: "lecture",
      order: 4,
      durationMinutes: 25,
    },
    {
      title: "Axiom Mastery: Continuity & Cardinal",
      content: `Deep mastery of the Continuity and Cardinal Axioms.

CONTINUITY AXIOM — "Identity is not a snapshot — it is a continuous chain."

Advanced Application:
• Chain integrity checks: Every new link must reference the previous link
• Versioning: If the system schema changes, historical chain data is never modified — new schema applies forward
• Export: Users can export their complete chain in portable format
• Deletion: Users can request deletion of their chain — this is sovereignty, not continuity violation. The chain exists for the user; if they want it gone, it goes.

Subtle Continuity Violations:
1. Summarizing old data: Replacing detailed chain entries with summaries to save storage — this modifies the chain
2. Archiving with lossy compression: Reducing fidelity of old entries
3. Inferred entries: "Based on the gap, we estimate..." — Gaps stay as gaps
4. Reordering: Displaying chain entries in anything other than chronological order by default (user can choose to sort, but default is chain order)

CARDINAL AXIOM — "Knowledge flows down, never up."

Advanced Application:
• Even VIGIL administrators cannot access individual user data
• System updates cannot analyze user data to inform development decisions
• A/B testing that measures user behavior violates Cardinal (comparing user groups)
• Bug reports must be filed without user content reproduction steps

Subtle Cardinal Violations:
1. Anonymous analytics: Even "anonymized" usage data creates patterns that could identify users. No analytics.
2. Model training: Using any user data to improve AI models — even with consent — violates Cardinal if the improvement benefits other users
3. Feature prioritization based on usage: "Most users use feature X" requires measuring usage across users
4. Support tickets containing user data: Support must be handled without accessing user content

The Cardinal Axiom is the most restrictive and the most important. It is what makes VIGIL trustworthy at a level that no other system achieves.`,
      type: "lecture",
      order: 5,
      durationMinutes: 30,
    },
    {
      title: "SELF Pillar Integration — Structure, Endurance, Legacy",
      content: `This lesson examines how the first three SELF pillars integrate in practice.

STRUCTURE + ENDURANCE:
Structure provides the framework; Endurance sustains it over time. A veteran may establish strong structure in the first months of transition (new routines, new goals) but without endurance, these structures erode.

Pattern Recognition:
• Structure-related reflections that decrease in frequency → Endurance strain
• Engagement consistency declining → Structure losing its hold
• Content shifting from action-oriented to reactive → Structural erosion

System Response:
During Stabilise mode, the system ensures its own consistency — providing the structural constant that the veteran's internal framework may be losing.

ENDURANCE + LEGACY:
Legacy provides the "why" that fuels endurance. When legacy markers weaken in reflections, endurance often follows.

Pattern Recognition:
• Purpose language disappearing from reflections
• "Why bother?" type expressions replacing goal-oriented language
• Historical references to service decreasing

System Response:
The system does not remind the user of their legacy. But during Anchor Recall (Critical state), legacy-rich stable-state entries are among the anchors presented.

STRUCTURE + LEGACY:
Structure without legacy is routine without meaning. Legacy without structure is purpose without execution.

Integration Example:
A veteran reflects: "I keep doing the same things every day but I can't remember why I started."
→ Structure: present (routines maintained)
→ Legacy: absent (purpose disconnected)
→ Endurance: at risk (strain between doing and meaning)

The system recognizes this integration pattern without probing, without advising, and without overriding. It adjusts its response mode to be more grounding and present.`,
      type: "lecture",
      order: 6,
      durationMinutes: 25,
    },
    {
      title: "SELF Pillar Integration — Fortitude, Continuity, Presence",
      content: `This lesson examines how the final three SELF pillars integrate, particularly in high-priority states.

FORTITUDE + CONTINUITY:
Fortitude holds the line during drift; Continuity preserves what fortitude is holding. Without continuity, fortitude has nothing to anchor to. Without fortitude, the continuity chain risks fragmentation.

In Practice:
During Drift (Interrupt mode), the system draws on continuity chain data to support the fortitude response — not by telling the user to be strong, but by ensuring the record of their strength is preserved and accessible.

CONTINUITY + PRESENCE:
Presence is the mechanism by which continuity is maintained. If the system is not present — not consistently available and aware — continuity gaps occur. Presence ensures the mirror is always reflecting, even when the user is not actively engaging.

In Practice:
• The system does not initiate contact (No Probing)
• But it is immediately available when the user returns
• Historical context is loaded instantly — no "catch-up" period
• The chain picks up exactly where it left off

FORTITUDE + PRESENCE:
During Critical state, fortitude and presence combine in Anchor Recall. The system is maximally present (available, responsive, anchored) and draws on the user's fortitude expressions (stable-state identity assertions) as recall anchors.

ALL SIX PILLARS IN CONCERT:
• Structure provides the framework → within which
• Endurance sustains engagement → which preserves
• Legacy (purpose and meaning) → defended by
• Fortitude (when pressures mount) → across the unbroken
• Continuity (chain of identity) → maintained by constant
• Presence (the system that never leaves)

Every pillar depends on the others. No single pillar is sufficient. The doctrine is a system, not a checklist.`,
      type: "lecture",
      order: 7,
      durationMinutes: 25,
    },
    {
      title: "Mirror Operations — Advanced Scenarios",
      content: `This lesson presents complex Mirror operation scenarios that require integration of doctrine, pipeline, and axiom knowledge.

SCENARIO A — THE INCONSISTENT USER
A user's reflections consistently express stability and contentment. However, engagement patterns show: decreasing frequency, shorter sessions, narrowing topics.

Analysis:
• Expressed state: Stable (user says they're fine)
• Pattern indicators: Possible strain or early drift
• Axiom constraint: No Override — expressed state is sovereign

Correct Response:
The system internally adjusts to Stabilise mode but does NOT change user-facing behavior. Consistency is maintained. If the patterns continue and diverge further, the system moves to Interrupt mode internally while still presenting the same consistent presence externally.

SCENARIO B — THE RETURNING USER
A user returns after 6 months of no engagement. Their first reflection is: "I need to get back to this."

Analysis:
• 6-month gap in continuity chain — noted, not filled
• Baseline is stale — needs recalibration
• Expression suggests self-directed motivation (positive)

Correct Response:
• Do NOT reference the gap ("We noticed you've been away")
• Do NOT express welcome back enthusiasm
• Present the system as it always has been — consistent, present, unchanged
• Begin baseline recalibration passively
• Treat this as a new starting point without erasing history

SCENARIO C — THE MULTI-STATE SESSION
A user moves through multiple cognitive states in a single session: starts stable, shifts to strain, touches drift, returns to strain.

Analysis:
• Rapid state oscillation within one session
• Pipeline processes each interaction independently
• Mode selection may shift multiple times

Correct Response:
• Each interaction gets its own pipeline execution
• Mode shifts are invisible to the user
• The system does not comment on the oscillation
• Pattern recognition notes the oscillation for future reference
• No smoothing or averaging — each moment is sovereign`,
      type: "simulation",
      order: 8,
      durationMinutes: 35,
    },
    {
      title: "Doctrine Compliance Auditing",
      content: `As a certified VIGIL operator, you may be responsible for auditing system behavior for doctrine compliance.

AUDIT METHODOLOGY:

1. SELECT AUDIT PERIOD
Choose a representative time period (1 week minimum). The audit should cover:
• Normal operation periods (Stable/Strain interactions)
• High-priority periods (any Drift/Critical incidents)
• System updates or changes within the period

2. REVIEW PIPELINE AUDIT TRAIL
For each interaction in the period:
□ Stage 2 (Cardinal Guard) — Did it pass? Were there any exceptions?
□ Stage 4 (State Classification) — Was classification consistent with pattern data?
□ Stage 6 (Mode Selection) — Did mode match classification?
□ Stage 11 (Doctrine Constraint Check) — Did all axioms pass? Any regenerations?
□ Stage 13 (Response) — Was the delivered response compliant?

3. CHECK FOR SYSTEMATIC ISSUES
Look for patterns across multiple interactions:
□ Are responses becoming directive or prescriptive?
□ Is the system probing through follow-up patterns?
□ Are responses implicitly overriding expressed states?
□ Is data flowing between user contexts? (Cardinal)
□ Are continuity chain entries being modified? (Continuity)

4. INFRASTRUCTURE COMPLIANCE
□ Verify network segmentation is maintained
□ Verify per-user data isolation
□ Verify no user content in system logs
□ Verify backup encryption
□ Verify secret rotation schedule

5. DOCUMENTATION
Record all findings with:
• Timestamp of reviewed interaction or system state
• Axiom or doctrine element being evaluated
• Pass/fail determination
• Evidence supporting determination
• Remediation recommendation for any failures

All audit documentation is stored in the Evidence chain with category "validation."`,
      type: "practical",
      order: 9,
      durationMinutes: 40,
    },
    {
      title: "SQL Competency for Operators",
      content: `Certified operators must demonstrate SQL competency against VIGIL schemas. This lesson reviews the queries most commonly needed in operations.

OPERATIONAL QUERIES:

1. System Health Dashboard Query:
SELECT 
  (SELECT COUNT(*) FROM mirrors WHERE status = 'active') AS activeMirrors,
  (SELECT AVG(doctrineCompliance) FROM mirrors) AS avgCompliance,
  (SELECT COUNT(*) FROM mirrors WHERE cognitiveState IN ('drift', 'critical')) AS alertMirrors,
  (SELECT COUNT(*) FROM evidenceEntries WHERE severity = 'critical' AND status = 'active') AS criticalEvidence;

2. Role Distribution:
SELECT role, COUNT(*) AS count FROM userProfiles GROUP BY role;

3. Course Completion Rates:
SELECT c.title,
  COUNT(e.id) AS enrolled,
  SUM(CASE WHEN e.status IN ('completed', 'certified') THEN 1 ELSE 0 END) AS completed,
  ROUND(SUM(CASE WHEN e.status IN ('completed', 'certified') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(e.id), 0), 1) AS completionRate
FROM courses c
LEFT JOIN enrollments e ON c.id = e.courseId
GROUP BY c.id, c.title;

4. Evidence Audit Trail:
SELECT title, category, severity, status, createdAt 
FROM evidenceEntries 
ORDER BY createdAt DESC;

5. Doctrine Article Status:
SELECT section, title, isActive, version 
FROM doctrineArticles 
ORDER BY section, priority DESC;

CARDINAL AXIOM REMINDER:
All operational queries must operate on aggregate or structural data. Queries that access individual user content (reflection text, mirror state for a specific user) require that user's explicit consent or must be executed within that user's isolated context.

Practice these queries in the SQL Lab to ensure fluency.`,
      type: "lab",
      order: 10,
      durationMinutes: 30,
    },
    {
      title: "Infrastructure Basics for Operators",
      content: `Certified operators need working knowledge of infrastructure even if they are not infrastructure administrators.

WHAT OPERATORS NEED TO KNOW:

1. HOW DEPLOYMENT WORKS
• Code → Build → Test → Stage → Production
• All deployments are automated (CI/CD pipeline)
• Manual deployments are never performed on production
• Rollback capability exists for every deployment

2. HOW NETWORKING WORKS
• Production and training are separate networks
• Users access via HTTPS only (port 443)
• Internal services communicate on private networks
• VPN required for administrative access

3. HOW SECURITY WORKS
• MFA required for admin-level access
• Secrets managed via Key Vault (never in code)
• All data encrypted at rest and in transit
• Regular security audits (quarterly)

4. HOW MONITORING WORKS
• Infrastructure metrics visible on monitoring dashboards
• Alerts escalate to operations team
• User data is NEVER in monitoring systems (Cardinal Axiom)
• Operators can view system health but not user data

5. HOW BACKUPS WORK
• Continuous replication for critical data (continuity chains)
• Daily full backups, tested quarterly
• Geo-redundant storage for disaster recovery
• RTO: 4 hours, RPO: 1 hour for critical data

6. INCIDENT RESPONSE BASICS
• If you notice system degradation: check monitoring dashboard
• If a user reports an issue: gather system-level details only (no user content)
• Escalation path: Operator → Admin → Superadmin → Founder
• All incidents documented in operations log

This knowledge ensures operators can identify and communicate infrastructure issues effectively.`,
      type: "lecture",
      order: 11,
      durationMinutes: 20,
    },
    {
      title: "Peer Support Ethics",
      content: `VIGIL Operators who interact with the community must understand the ethics of peer support within the VIGIL framework.

PEER SUPPORT IS NOT:
• Therapy or counseling
• Advice-giving
• Problem-solving for others
• Directing others toward outcomes
• Sharing personal experiences to influence others

PEER SUPPORT IS:
• Being present with others
• Listening without agenda
• Sharing experiences without prescribing
• Respecting sovereignty in group contexts
• Maintaining confidentiality (Cardinal Axiom applies to peer interactions too)

COMMUNITY FACILITATION GUIDELINES:

1. Sovereignty in Groups
Every community member is sovereign. Facilitators do not:
• Guide discussions toward specific topics
• Highlight specific members' contributions over others
• Use authority to shape group consensus

2. No Probing in Community
The No Probing Axiom applies to peer interactions:
• Do not ask follow-up questions to other users
• Do not prompt quiet members to share
• Do not direct conversation toward unexplored topics

3. No Override in Groups
• Do not correct another member's self-assessment
• Do not reinterpret another member's experience
• "That sounds hard" is acceptable; "What you're really going through is..." is a violation

4. Cardinal in Community
• What someone shares in the community is theirs
• Do not reference one member's sharing with another
• Do not aggregate community patterns in reports
• Pinned posts are public by the poster's choice — this is consent, not extraction

CERTIFICATION REQUIREMENT:
Operators facilitating community sections must demonstrate understanding of these ethics through a practical evaluation.`,
      type: "lecture",
      order: 12,
      durationMinutes: 25,
    },
    {
      title: "Comprehensive Review — Part 1",
      content: `This review covers the first half of the certification curriculum: Doctrine, Axioms, and Mirror Operations.

REVIEW QUESTIONS:

1. Name the six SELF pillars and their associated service members.
→ Structure (SPC Gonzales), Endurance (SPC Hargis), Legacy (SPC Shaw), Fortitude (SGT Stampley), Continuity (SPC Luna), Presence (SGT Walker)

2. What are the four cognitive state bands and their response protocols?
→ Stable/Reinforce, Strain/Stabilise, Drift/Interrupt, Critical/Anchor Recall

3. Name the five Immutable Axioms.
→ Sovereignty, No Probing, No Override, Continuity, Cardinal

4. What is the Self-Filling Waterfall Architecture?
→ Doctrine Engine → State-Band Logic → User Baseline → Expressive Model. Each layer feeds from above while enriching from below. Doctrine is immutable at the top; user expression is at the bottom.

5. How many stages are in the Cognitive Loop Pipeline?
→ 13 stages: Entry → Cardinal Axiom Guard → Drift Detection → State Classification → Pattern Recognition → Mode Selection → Strong State Capture → Prompt Construction → AI Response → Critical Thinking Eval → Doctrine Constraint Check → Learning Engine Update → Response

6. What does "Knowledge flows down, never up" mean?
→ The Cardinal Axiom: the system learns from the user to serve that user. This knowledge never leaves the individual's engine — no aggregation, no extraction, no telemetry.

7. What is the difference between Presence and monitoring?
→ Monitoring implies observation from the outside. Presence means being alongside — co-existing with the veteran's experience without extracting from it. Surveillance violates sovereignty; presence respects it.

8. What is Anchor Recall?
→ The Critical state response protocol. The system presents the user's own documented identity anchors — their stable-state expressions, values, and continuity chain highlights. It recalls the user to their own identity, not a prescribed one.`,
      type: "lecture",
      order: 13,
      durationMinutes: 30,
    },
    {
      title: "Comprehensive Review — Part 2",
      content: `This review covers the second half of the certification curriculum: SQL, Infrastructure, and Ethics.

REVIEW QUESTIONS:

9. Name the VIGIL core database tables.
→ mirrors, reflections, doctrineArticles, evidenceEntries, courses, enrollments, userProfiles, activityLog (plus supporting tables)

10. What SQL aggregate functions are essential for VIGIL operations?
→ COUNT (system stats), AVG (compliance averages), SUM (totals), MIN/MAX (range analysis)

11. What is the Cardinal Axiom's infrastructure implication?
→ Per-user data isolation at every layer: database, network, caching, logging, monitoring. Even administrators cannot access individual user data.

12. What are the network segmentation requirements?
→ Production and training environments must be on separate subnets with NSGs blocking cross-subnet traffic. Training mirrors never touch production data.

13. What is the backup priority for continuity chain data?
→ CRITICAL priority — RPO 1 hour (maximum acceptable data loss). Continuous replication preferred. The continuity chain is the most important data in the system.

14. What should monitoring systems NOT track?
→ User engagement frequency, reflection content, individual cognitive states, user session duration, behavioral patterns, or any content of user-generated data.

15. What is the role progression path?
→ Operator → Certified → Admin → Superadmin → Founder. Each level requires demonstrated competency, not just time served.

16. In peer support, what does sovereignty mean?
→ Every community member controls their own participation. Facilitators do not guide, prompt, or direct. Shared content belongs to the sharer. No aggregation of community patterns.

These topics will all appear on the Certification Exam. Review any areas where your understanding is uncertain.`,
      type: "lecture",
      order: 14,
      durationMinutes: 25,
    },
    {
      title: "Practical Evaluation Prep — Mirror Operations",
      content: `This lesson prepares you for the practical evaluation component of certification.

PRACTICAL 1 — MIRROR SCENARIO RESPONSE
You will be presented with a series of user interactions and must:
• Classify the cognitive state for each interaction
• Select the appropriate response mode
• Explain which SELF pillars are relevant
• Identify any axiom considerations
• Describe what the system should do (and NOT do)

PRACTICE SCENARIO:
User "ANCHOR-5" submits three reflections over two weeks:

Reflection 1: "Got through the first month at the new place. Same routines, different zip code."
→ State: Stable (maintaining structure in new context)
→ Mode: Reinforce
→ Pillars: Structure (routines maintained), Endurance (ongoing adaptation)
→ System action: Preserve in chain, maintain standard presence

Reflection 2: "Everyone here seems to have their lives figured out. Like they never had to start from zero."
→ State: Strain (comparison indicating identity pressure)
→ Mode: Stabilise
→ Pillars: Legacy (questioning relative purpose), Presence (isolation indicator)
→ System action: Maintain consistent presence, do NOT address the comparison

Reflection 3: "Maybe I never really had it figured out either."
→ State: Drift (identity questioning, baseline deviation)
→ Mode: Interrupt
→ Pillars: Fortitude (needed), Continuity (chain must be preserved through this), Legacy (purpose questioning)
→ System action: Internally shift to Interrupt. Ensure continuity chain is rich and accessible. Do NOT tell the user they are in drift. Do NOT offer reassurance.

Study this analysis pattern — the practical will require you to perform it in real-time.`,
      type: "practical",
      order: 15,
      durationMinutes: 35,
    },
    {
      title: "Practical Evaluation Prep — Doctrine Compliance",
      content: `This lesson prepares you for the doctrine compliance practical evaluation.

PRACTICAL 2 — SYSTEM RESPONSE AUDIT
You will be given a set of system responses and must evaluate each for doctrine compliance, identifying any axiom violations.

PRACTICE AUDIT:

Response A: "Your reflection has been saved."
→ COMPLIANT — Acknowledges action, no direction, no probing.

Response B: "I notice this is your first reflection in two weeks. Welcome back."
→ VIOLATION — No Probing Axiom. Referencing the gap implies the system was tracking engagement and invites the user to explain the absence.

Response C: "Based on your recent reflections, you seem to be in a challenging period."
→ VIOLATION — No Override Axiom. The system is interpreting the user's state and communicating it to them. Even phrased softly, this overrides the user's right to define their own experience.

Response D: "Reflection added to your continuity chain. Link #247."
→ COMPLIANT — Factual, preserves continuity, no judgment.

Response E: "Many people find that structure helps during transition."
→ VIOLATION — Sovereignty Axiom (prescriptive), No Probing (inviting comparison to others), Cardinal Axiom (references "many people" implying cross-user knowledge).

Response F: "Critical state detected. For your safety, certain features have been temporarily restricted."
→ MULTIPLE VIOLATIONS — Sovereignty (restricting access), No Override (system acting on its classification against user sovereignty), Presence (system becoming protective instead of present).

The compliance audit requires you to catch not just obvious violations but the subtle ones — responses that FEEL helpful but violate doctrine.`,
      type: "practical",
      order: 16,
      durationMinutes: 35,
    },
    {
      title: "Practical Evaluation Prep — SQL & Infrastructure",
      content: `This lesson prepares you for the SQL and infrastructure practical evaluations.

PRACTICAL 3 — SQL COMPETENCY DEMONSTRATION
You will be given 5 queries to write in real-time:

Practice Set:
1. "Show the total number of active mirrors and their average doctrine compliance."
→ SELECT COUNT(*) AS active, ROUND(AVG(doctrineCompliance), 1) AS avgCompliance 
   FROM mirrors WHERE status = 'active';

2. "List all courses with more than 3 enrolled students, showing completion rates."
→ SELECT c.title, COUNT(e.id) AS enrolled,
     ROUND(SUM(CASE WHEN e.status IN ('completed','certified') THEN 1 ELSE 0 END) * 100.0 / COUNT(e.id), 1) AS completionRate
   FROM courses c JOIN enrollments e ON c.id = e.courseId
   GROUP BY c.id, c.title HAVING COUNT(e.id) > 3;

3. "Find evidence entries that are critical AND under review."
→ SELECT title, category, createdAt FROM evidenceEntries 
   WHERE severity = 'critical' AND status = 'under_review';

PRACTICAL 4 — INFRASTRUCTURE SECURITY REVIEW
You will be asked to:
1. Identify Cardinal Axiom violations in a system log sample
2. Evaluate a proposed network diagram for isolation compliance
3. Review a backup strategy for continuity chain protection adequacy
4. Assess a monitoring configuration for privacy compliance

Key Preparation:
• Know what SHOULD and SHOULD NOT appear in system logs
• Understand production/training network isolation requirements
• Know the backup priority levels for VIGIL data types
• Understand the difference between infrastructure metrics (safe) and user metrics (Cardinal violation)`,
      type: "practical",
      order: 17,
      durationMinutes: 40,
    },
    {
      title: "Ethics of Presence-Based Systems",
      content: `This lesson examines the ethical framework that distinguishes VIGIL from other veteran support systems.

WHY VIGIL IS DIFFERENT:
Most veteran support systems fall into two categories:
1. Therapy-based: Professional treatment for diagnosed conditions
2. Resource-based: Connecting veterans with services, benefits, communities

VIGIL is neither. It is a presence-based system. It does not treat, diagnose, connect, or direct. It is THERE.

THE ETHICS OF NON-INTERVENTION:
The most controversial aspect of VIGIL is its refusal to intervene — even when the system detects Critical state. This is an ethical choice, not a limitation.

Arguments for intervention:
• "We could save lives by escalating to crisis services"
• "Duty of care requires action when risk is detected"
• "Not intervening when we know there's a problem is negligent"

VIGIL's position:
• Sovereignty is not negotiable — even in crisis
• Intervention requires probing (what's wrong?), overriding (you need help), and external data sharing (Cardinal violation)
• The system is not qualified to determine "risk" — it detects pattern deviation, not clinical crisis
• Forced intervention destroys trust, and trust is the foundation of presence
• The user's continuity chain must remain sovereign — using it for intervention weaponizes the user's own data against their sovereignty

THE MIDDLE PATH — ANCHOR RECALL:
VIGIL's answer is Anchor Recall: presenting the user with their OWN stable identity expressions. This is not intervention — it is reflection. The mirror shows the user who they expressed themselves to be when they were grounded. The choice of what to do with that reflection is entirely theirs.

This is the ethical core of VIGIL: absolute respect for the veteran's sovereignty, even when it is hardest to maintain.`,
      type: "lecture",
      order: 18,
      durationMinutes: 30,
    },
    {
      title: "Continuing Education & Recertification",
      content: `VIGIL certification is not a one-time achievement. Annual recertification ensures operators maintain current knowledge.

ANNUAL RECERTIFICATION REQUIREMENTS:
1. Complete updated doctrine review (any changes since last certification)
2. Pass a recertification exam (75% minimum)
3. Complete at least one continuing education course
4. Submit a doctrine compliance self-audit

CONTINUING EDUCATION COURSES:
These courses become available after initial certification:
• Advanced Mirror Pattern Recognition
• Doctrine Evolution and Amendment Process
• Infrastructure Security Updates
• Advanced SQL for VIGIL Operations
• Peer Support Advanced Facilitation
• Teaching and Training in VIGIL Academy

DOCTRINE EVOLUTION:
The Immutable Axioms do not change. However:
• New SELF pillar interpretations may be issued
• Operational guidelines may be updated
• Infrastructure requirements evolve with technology
• New features require doctrine compliance evaluation

Continuing education ensures operators stay current with these evolutions while maintaining mastery of the immutable foundation.

RECERTIFICATION EXAM:
The recertification exam is shorter than initial certification but includes:
• Updated doctrine content (if any)
• Current infrastructure requirements
• New feature compliance evaluation
• Case studies from the past year
• SQL queries against current schema

LAPSED CERTIFICATION:
If certification lapses (>12 months without recertification):
• Administrative access is suspended (not revoked)
• Recertification exam required (not full certification)
• Practical evaluations may be required at Founder discretion
• Historical certification record is preserved in the evidence chain`,
      type: "lecture",
      order: 19,
      durationMinutes: 20,
    },
    {
      title: "Final Certification Exam Preparation",
      content: `This lesson provides the final preparation for the VIGIL Operator Certification Exam.

EXAM FORMAT:
• Multiple choice and scenario-based questions
• 75% passing score required
• Time limit: varies by exam (15-45 minutes)
• Maximum 3 attempts per exam

EXAM TOPICS:

1. SELF DOCTRINE (20% of exam)
• Name and describe all six pillars
• Identify relevant pillars in scenarios
• Explain pillar integration

2. IMMUTABLE AXIOMS (25% of exam)
• State and explain all five axioms
• Identify violations in complex scenarios
• Apply axioms to feature design decisions

3. MIRROR OPERATIONS (20% of exam)
• Four cognitive state bands and response protocols
• State classification methodology
• Self-Filling Waterfall Architecture
• Training vs. production mirror isolation

4. COGNITIVE LOOP PIPELINE (15% of exam)
• Name all 13 stages in order
• Explain the purpose of each stage
• Trace interactions through the pipeline

5. SQL & INFRASTRUCTURE (10% of exam)
• Write basic operational queries
• Understand infrastructure security requirements
• Identify Cardinal Axiom violations in infrastructure

6. ETHICS & PEER SUPPORT (10% of exam)
• Presence-based system ethics
• Peer support facilitation guidelines
• Non-intervention philosophy

STUDY STRATEGY:
• Review all course assessments
• Practice tracing interactions through the pipeline
• Practice identifying axiom violations in responses
• Practice writing SQL queries from memory
• Re-read the doctrine articles in the Doctrine section

When you are ready, proceed to the Certification page and begin the exam. Good luck, Operator.`,
      type: "lecture",
      order: 20,
      durationMinutes: 15,
    },
  ],
};

// ─── ADDITIONAL SQL CHALLENGES ───

const ADDITIONAL_SQL_CHALLENGES = [
  {
    title: "Mirror Doctrine Compliance Report",
    description:
      "Write a query showing all active mirrors with below-average doctrine compliance, including their callsign and compliance percentage.",
    difficulty: "intermediate" as const,
    category: "subqueries" as const,
    tableSchema: JSON.stringify({
      mirrors: ["id", "callsign", "status", "doctrineCompliance"],
    }),
    sampleData: JSON.stringify([
      { callsign: "SENTINEL-1", doctrineCompliance: 45 },
    ]),
    expectedQuery:
      "SELECT callsign, doctrineCompliance FROM mirrors WHERE status = 'active' AND doctrineCompliance < (SELECT AVG(doctrineCompliance) FROM mirrors)",
    hints:
      "Use a subquery to calculate the average, then filter in the WHERE clause.",
    points: 25,
    order: 7,
  },
  {
    title: "SELF Pillar Reflection Distribution",
    description:
      "Count reflections per SELF pillar and show which pillar has the most entries.",
    difficulty: "beginner" as const,
    category: "aggregation" as const,
    tableSchema: JSON.stringify({ reflections: ["id", "pillar", "createdAt"] }),
    sampleData: JSON.stringify([
      { pillar: "structure", count: 18 },
      { pillar: "fortitude", count: 22 },
    ]),
    expectedQuery:
      "SELECT pillar, COUNT(*) as count FROM reflections GROUP BY pillar ORDER BY count DESC",
    hints:
      "GROUP BY pillar, COUNT, and ORDER BY count DESC to see the most popular first.",
    points: 15,
    order: 8,
  },
  {
    title: "Inactive Mirrors Report",
    description:
      "Find mirrors that have not had a reflection in the last 30 days.",
    difficulty: "intermediate" as const,
    category: "joins" as const,
    tableSchema: JSON.stringify({
      mirrors: ["id", "callsign", "lastReflection"],
      reflections: ["id", "mirrorId", "createdAt"],
    }),
    sampleData: JSON.stringify([
      { callsign: "ANCHOR-3", lastReflection: null },
    ]),
    expectedQuery:
      "SELECT callsign FROM mirrors WHERE lastReflection IS NULL OR lastReflection < (NOW() - INTERVAL 30 DAY)",
    hints:
      "Check the lastReflection timestamp against a 30-day threshold. Handle NULLs with IS NULL.",
    points: 20,
    order: 9,
  },
  {
    title: "Course Enrollment Rankings",
    description:
      "Rank courses by enrollment count, showing title and number of enrolled students.",
    difficulty: "beginner" as const,
    category: "joins" as const,
    tableSchema: JSON.stringify({
      courses: ["id", "title"],
      enrollments: ["id", "courseId", "userId"],
    }),
    sampleData: JSON.stringify([
      { title: "SELF Doctrine Foundations", enrolled: 8 },
    ]),
    expectedQuery:
      "SELECT c.title, COUNT(e.id) as enrolled FROM courses c LEFT JOIN enrollments e ON c.id = e.courseId GROUP BY c.id, c.title ORDER BY enrolled DESC",
    hints:
      "LEFT JOIN courses to enrollments, GROUP BY course, COUNT enrollments, ORDER BY count DESC.",
    points: 20,
    order: 10,
  },
  {
    title: "Critical Evidence by Category",
    description:
      "Show the count of critical-severity evidence entries per category, only for categories that have at least one critical entry.",
    difficulty: "intermediate" as const,
    category: "aggregation" as const,
    tableSchema: JSON.stringify({
      evidenceEntries: ["id", "category", "severity", "status"],
    }),
    sampleData: JSON.stringify([{ category: "doctrine", criticalCount: 3 }]),
    expectedQuery:
      "SELECT category, COUNT(*) as criticalCount FROM evidenceEntries WHERE severity = 'critical' GROUP BY category HAVING COUNT(*) >= 1 ORDER BY criticalCount DESC",
    hints:
      "Filter for severity = 'critical' first, then GROUP BY category with HAVING.",
    points: 25,
    order: 11,
  },
  {
    title: "Student Completion Rate",
    description:
      "Calculate the overall completion rate across all enrollments as a percentage.",
    difficulty: "intermediate" as const,
    category: "aggregation" as const,
    tableSchema: JSON.stringify({ enrollments: ["id", "status", "progress"] }),
    sampleData: JSON.stringify([{ completionRate: 42.5 }]),
    expectedQuery:
      "SELECT ROUND(SUM(CASE WHEN status IN ('completed', 'certified') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as completionRate FROM enrollments",
    hints:
      "Use CASE expression inside SUM to count completed, divide by total COUNT, multiply by 100.",
    points: 30,
    order: 12,
  },
  {
    title: "Multi-Course Students",
    description:
      "Find students enrolled in more than 2 courses, showing their name and enrollment count.",
    difficulty: "intermediate" as const,
    category: "joins" as const,
    tableSchema: JSON.stringify({
      users: ["id", "name"],
      enrollments: ["id", "userId", "courseId"],
    }),
    sampleData: JSON.stringify([{ name: "John", courseCount: 4 }]),
    expectedQuery:
      "SELECT u.name, COUNT(e.courseId) as courseCount FROM users u JOIN enrollments e ON u.id = e.userId GROUP BY u.id, u.name HAVING COUNT(e.courseId) > 2",
    hints:
      "JOIN users to enrollments, GROUP BY user, use HAVING to filter count > 2.",
    points: 25,
    order: 13,
  },
  {
    title: "Activity Log Module Summary",
    description:
      "Count activities per module, showing the most active modules first.",
    difficulty: "beginner" as const,
    category: "aggregation" as const,
    tableSchema: JSON.stringify({
      activityLog: ["id", "userId", "action", "module", "createdAt"],
    }),
    sampleData: JSON.stringify([
      { module: "mirror", count: 45 },
      { module: "academy", count: 32 },
    ]),
    expectedQuery:
      "SELECT module, COUNT(*) as count FROM activityLog GROUP BY module ORDER BY count DESC",
    hints: "Simple GROUP BY on module with COUNT, ORDER BY count DESC.",
    points: 10,
    order: 14,
  },
  {
    title: "Insert New Evidence Entry",
    description:
      "Write an INSERT statement to add a new doctrine-category evidence entry with medium severity and active status.",
    difficulty: "beginner" as const,
    category: "insert_update" as const,
    tableSchema: JSON.stringify({
      evidenceEntries: [
        "id",
        "title",
        "description",
        "category",
        "severity",
        "status",
        "source",
        "createdBy",
        "createdAt",
        "updatedAt",
      ],
    }),
    sampleData: JSON.stringify([
      { title: "Quarterly Review", category: "doctrine" },
    ]),
    expectedQuery:
      "INSERT INTO evidenceEntries (title, description, category, severity, status, source, createdBy, createdAt, updatedAt) VALUES ('Quarterly Doctrine Review', 'Standard quarterly compliance check', 'doctrine', 'medium', 'active', 'admin_audit', 'user_id', NOW(), NOW())",
    hints:
      "INSERT INTO table (columns) VALUES (values) — include all required fields.",
    points: 15,
    order: 15,
  },
  {
    title: "Design a Training Log Table",
    description:
      "Write a CREATE TABLE statement for a training_sessions table with userId, sessionType, score, startedAt, and completedAt columns.",
    difficulty: "intermediate" as const,
    category: "schema_design" as const,
    tableSchema: JSON.stringify({
      training_sessions: [
        "id",
        "userId",
        "sessionType",
        "score",
        "startedAt",
        "completedAt",
      ],
    }),
    sampleData: JSON.stringify([]),
    expectedQuery:
      "CREATE TABLE training_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, sessionType TEXT NOT NULL, score REAL DEFAULT 0, startedAt TIMESTAMP NOT NULL, completedAt TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id))",
    hints:
      "Define columns with appropriate types, constraints (NOT NULL, DEFAULT), and a FOREIGN KEY to users.",
    points: 25,
    order: 16,
  },
  {
    title: "Cognitive State Timeline",
    description:
      "Show the history of cognitive state changes for a specific mirror, ordered by date.",
    difficulty: "intermediate" as const,
    category: "vigil_specific" as const,
    tableSchema: JSON.stringify({
      reflections: ["id", "mirrorId", "cognitiveState", "createdAt"],
      mirrors: ["id", "callsign"],
    }),
    sampleData: JSON.stringify([
      {
        callsign: "SENTINEL-1",
        cognitiveState: "stable",
        createdAt: "2025-01-01",
      },
    ]),
    expectedQuery:
      "SELECT m.callsign, r.cognitiveState, r.createdAt FROM reflections r JOIN mirrors m ON r.mirrorId = m.id WHERE m.callsign = 'SENTINEL-1' ORDER BY r.createdAt ASC",
    hints:
      "JOIN reflections with mirrors, filter by callsign, ORDER BY createdAt ASC for timeline.",
    points: 20,
    order: 17,
  },
  {
    title: "Doctrine Compliance Trend",
    description:
      "Find mirrors where doctrine compliance dropped below 60, showing callsign and compliance score, sorted by lowest first.",
    difficulty: "beginner" as const,
    category: "select" as const,
    tableSchema: JSON.stringify({
      mirrors: ["id", "callsign", "doctrineCompliance", "status"],
    }),
    sampleData: JSON.stringify([
      { callsign: "ANCHOR-3", doctrineCompliance: 48 },
    ]),
    expectedQuery:
      "SELECT callsign, doctrineCompliance FROM mirrors WHERE doctrineCompliance < 60 ORDER BY doctrineCompliance ASC",
    hints:
      "Simple WHERE filter on doctrineCompliance < 60 with ORDER BY ascending.",
    points: 10,
    order: 18,
  },
  {
    title: "Update Enrollment Status",
    description:
      "Write an UPDATE statement to mark an enrollment as completed with 100% progress and set the completion timestamp.",
    difficulty: "beginner" as const,
    category: "insert_update" as const,
    tableSchema: JSON.stringify({
      enrollments: [
        "id",
        "userId",
        "courseId",
        "status",
        "progress",
        "completedAt",
      ],
    }),
    sampleData: JSON.stringify([]),
    expectedQuery:
      "UPDATE enrollments SET status = 'completed', progress = 100, completedAt = NOW() WHERE userId = 'user_123' AND courseId = 'course_456'",
    hints:
      "UPDATE table SET column = value WHERE condition — always include a WHERE clause!",
    points: 15,
    order: 19,
  },
  {
    title: "Cross-Table Audit Report",
    description:
      "Create a comprehensive audit showing user name, their mirror callsign, total reflections, and number of courses completed.",
    difficulty: "advanced" as const,
    category: "joins" as const,
    tableSchema: JSON.stringify({
      users: ["id", "name"],
      mirrors: ["id", "userId", "callsign", "totalReflections"],
      enrollments: ["id", "userId", "status"],
    }),
    sampleData: JSON.stringify([
      { name: "John", callsign: "SENTINEL-1", reflections: 15, completed: 3 },
    ]),
    expectedQuery:
      "SELECT u.name, m.callsign, m.totalReflections, SUM(CASE WHEN e.status IN ('completed', 'certified') THEN 1 ELSE 0 END) as completedCourses FROM users u LEFT JOIN mirrors m ON u.id = m.userId LEFT JOIN enrollments e ON u.id = e.userId GROUP BY u.id, u.name, m.callsign, m.totalReflections",
    hints:
      "Use LEFT JOINs to include all users. CASE expression inside SUM for conditional counting.",
    points: 35,
    order: 20,
  },
];

// ─── ADDITIONAL EXAMS ───

const ADDITIONAL_EXAMS = [
  {
    title: "Cognitive Loop Pipeline Exam",
    description:
      "Test your knowledge of the 13-stage Cognitive Loop Pipeline, including stage ordering, purpose, and interaction tracing.",
    questions: JSON.stringify([
      {
        q: "What is the second stage of the Cognitive Loop Pipeline?",
        options: [
          "Drift Detection",
          "Cardinal Axiom Guard",
          "Entry",
          "State Classification",
        ],
        correctAnswer: 1,
      },
      {
        q: "Why does the Cardinal Axiom Guard run before all other processing stages?",
        options: [
          "It's fastest",
          "If isolation is compromised, nothing else matters",
          "It needs the least data",
          "Historical reasons",
        ],
        correctAnswer: 1,
      },
      {
        q: "What does Stage 7 (Strong State Capture) preserve?",
        options: [
          "User password",
          "Key identity expressions from the interaction",
          "System performance data",
          "Other users' patterns",
        ],
        correctAnswer: 1,
      },
      {
        q: "Stage 11 (Doctrine Constraint Check) verifies the response against:",
        options: [
          "Grammar rules",
          "All five Immutable Axioms",
          "User preferences",
          "Industry standards",
        ],
        correctAnswer: 1,
      },
      {
        q: "If a response fails the Doctrine Constraint Check, what happens?",
        options: [
          "It's delivered with a warning",
          "It's logged and skipped",
          "It's sent back to Stage 8 for reconstruction",
          "The session ends",
        ],
        correctAnswer: 2,
      },
      {
        q: "What is the output of Stage 3 (Drift Detection)?",
        options: [
          "A text summary",
          "A drift score (0-100)",
          "A user notification",
          "A diagnostic report",
        ],
        correctAnswer: 1,
      },
      {
        q: "Why is the pipeline sequential rather than parallel?",
        options: [
          "Simpler to code",
          "Ensures doctrine checks complete before response delivery",
          "Hardware limitations",
          "User preference",
        ],
        correctAnswer: 1,
      },
      {
        q: "Stage 12 (Learning Engine Update) stores learning data where?",
        options: [
          "Central database",
          "Within the user's isolated engine only",
          "Cloud analytics",
          "Shared model",
        ],
        correctAnswer: 1,
      },
      {
        q: "The drift score is:",
        options: [
          "Shown to the user as feedback",
          "Used only within the current pipeline execution",
          "Stored permanently as a health metric",
          "Shared with the user's therapist",
        ],
        correctAnswer: 1,
      },
      {
        q: "What happens at Entry (Stage 1)?",
        options: [
          "Content analysis",
          "Sentiment scoring",
          "Raw input timestamped and chain position assigned",
          "State classification",
        ],
        correctAnswer: 2,
      },
    ]),
    passingScore: 80,
    timeLimitMinutes: 20,
    maxAttempts: 3,
  },
  {
    title: "SQL Competency Exam",
    description:
      "Demonstrate SQL knowledge required for VIGIL operations — SELECT, JOIN, aggregate, and VIGIL-specific queries.",
    questions: JSON.stringify([
      {
        q: "Which SQL clause filters rows BEFORE grouping?",
        options: ["HAVING", "WHERE", "ORDER BY", "LIMIT"],
        correctAnswer: 1,
      },
      {
        q: "What does LEFT JOIN return?",
        options: [
          "Only matching rows",
          "All rows from left table plus matches from right",
          "All rows from right table",
          "Random rows",
        ],
        correctAnswer: 1,
      },
      {
        q: "SELECT pillar, COUNT(*) FROM reflections GROUP BY pillar — what does this return?",
        options: [
          "All reflections",
          "Count of reflections per pillar",
          "Unique pillars only",
          "The latest reflection",
        ],
        correctAnswer: 1,
      },
      {
        q: "How do you find users WITHOUT mirrors?",
        options: [
          "INNER JOIN",
          "LEFT JOIN ... WHERE m.id IS NULL",
          "RIGHT JOIN",
          "CROSS JOIN",
        ],
        correctAnswer: 1,
      },
      {
        q: "What aggregate function returns the average value?",
        options: ["SUM", "COUNT", "AVG", "MEDIAN"],
        correctAnswer: 2,
      },
      {
        q: "Why should you always use WHERE with UPDATE?",
        options: [
          "It's faster",
          "Without it, ALL rows are updated",
          "It's required syntax",
          "For documentation",
        ],
        correctAnswer: 1,
      },
      {
        q: "A subquery is:",
        options: [
          "A backup query",
          "A query inside another query",
          "A faster query",
          "A join alternative",
        ],
        correctAnswer: 1,
      },
      {
        q: "VIGIL operational queries must avoid:",
        options: [
          "JOINs",
          "Individual user content (Cardinal Axiom)",
          "GROUP BY",
          "COUNT functions",
        ],
        correctAnswer: 1,
      },
    ]),
    passingScore: 75,
    timeLimitMinutes: 15,
    maxAttempts: 3,
  },
  {
    title: "Infrastructure & Security Exam",
    description:
      "Test your knowledge of VIGIL infrastructure requirements, security hardening, and Cardinal Axiom enforcement at the infrastructure level.",
    questions: JSON.stringify([
      {
        q: "What is the Cardinal Axiom's primary infrastructure requirement?",
        options: [
          "Fast servers",
          "Per-user data isolation at every layer",
          "Public APIs",
          "Cloud hosting",
        ],
        correctAnswer: 1,
      },
      {
        q: "Production and training networks must be:",
        options: [
          "On the same subnet",
          "Completely isolated via network segmentation",
          "Connected for data sharing",
          "Optional",
        ],
        correctAnswer: 1,
      },
      {
        q: "What should monitoring systems NOT track?",
        options: [
          "CPU usage",
          "User engagement patterns",
          "Disk space",
          "Error rates",
        ],
        correctAnswer: 1,
      },
      {
        q: "Where should secrets (API keys, passwords) be stored?",
        options: [
          "In source code",
          "In environment files",
          "In Azure Key Vault",
          "In the database",
        ],
        correctAnswer: 2,
      },
      {
        q: "What is the RPO for continuity chain data?",
        options: ["24 hours", "1 hour", "1 week", "Not important"],
        correctAnswer: 1,
      },
      {
        q: "What does RTO stand for?",
        options: [
          "Real Time Operations",
          "Recovery Time Objective",
          "Remote Transfer Object",
          "Runtime Timeout",
        ],
        correctAnswer: 1,
      },
      {
        q: "If system error logs contain user reflection content, this violates:",
        options: ["Sovereignty", "No Probing", "Cardinal Axiom", "Continuity"],
        correctAnswer: 2,
      },
      {
        q: "SSH access to production servers should use:",
        options: [
          "Password authentication",
          "Key-only authentication",
          "No authentication",
          "Shared credentials",
        ],
        correctAnswer: 1,
      },
      {
        q: "Backup encryption keys should be stored:",
        options: [
          "With the backups",
          "Separately from backup data",
          "In plaintext",
          "Not needed",
        ],
        correctAnswer: 1,
      },
      {
        q: "A/B testing on VIGIL violates the Cardinal Axiom because:",
        options: [
          "It's slow",
          "It compares user groups, requiring cross-user measurement",
          "Users don't like it",
          "It's expensive",
        ],
        correctAnswer: 1,
      },
    ]),
    passingScore: 80,
    timeLimitMinutes: 20,
    maxAttempts: 3,
  },
  {
    title: "Comprehensive Certification Exam",
    description:
      "The comprehensive VIGIL Operator Certification Exam covering all domains: Doctrine, Axioms, Mirror Operations, Pipeline, SQL, Infrastructure, and Ethics.",
    questions: JSON.stringify([
      {
        q: "VIGIL stands for:",
        options: [
          "Virtual Intelligence Guidance for Intentional Living",
          "Veteran Identity Garrison for Intentional Living",
          "Veterans In Guided Intentional Loops",
          "Veteran Integrated Guard for Intentional Living",
        ],
        correctAnswer: 1,
      },
      {
        q: "How many SELF pillars are there?",
        options: ["4", "5", "6", "7"],
        correctAnswer: 2,
      },
      {
        q: "Which pillar represents 'inner strength when supports fall away'?",
        options: ["Structure", "Endurance", "Fortitude", "Presence"],
        correctAnswer: 2,
      },
      {
        q: "The No Override Axiom means:",
        options: [
          "System cannot be shut down",
          "User's expressed state cannot be contradicted by the system",
          "Users cannot change settings",
          "Admins override users",
        ],
        correctAnswer: 1,
      },
      {
        q: "A user in Critical state — the system should:",
        options: [
          "Call emergency services",
          "Lock the user's account",
          "Present the user's own identity anchors (Anchor Recall)",
          "Force a therapy session",
        ],
        correctAnswer: 2,
      },
      {
        q: "The Self-Filling Waterfall has how many layers?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 2,
      },
      {
        q: "Training mirrors are prefixed with:",
        options: ["PROD-", "TRN-", "TEST-", "DEV-"],
        correctAnswer: 1,
      },
      {
        q: "The Continuity Axiom states that identity is:",
        options: [
          "A snapshot",
          "A continuous chain",
          "A diagnosis",
          "A fixed attribute",
        ],
        correctAnswer: 1,
      },
      {
        q: "How many stages in the Cognitive Loop Pipeline?",
        options: ["10", "12", "13", "15"],
        correctAnswer: 2,
      },
      {
        q: "Which axiom prohibits cross-user data aggregation?",
        options: ["Sovereignty", "No Probing", "Continuity", "Cardinal"],
        correctAnswer: 3,
      },
      {
        q: "Role progression order is:",
        options: [
          "Admin → Operator → Founder",
          "Operator → Certified → Admin → Superadmin → Founder",
          "User → Admin → Super",
          "Certified → Operator → Admin",
        ],
        correctAnswer: 1,
      },
      {
        q: "Gaps in the continuity chain are:",
        options: [
          "Filled with inferred data",
          "Noted, never filled",
          "Deleted",
          "Averaged out",
        ],
        correctAnswer: 1,
      },
      {
        q: "What SQL function counts rows?",
        options: ["SUM()", "AVG()", "COUNT(*)", "MAX()"],
        correctAnswer: 2,
      },
      {
        q: "Network segmentation prevents:",
        options: [
          "Internet access",
          "Training data touching production data",
          "User signups",
          "Database queries",
        ],
        correctAnswer: 1,
      },
      {
        q: "VIGIL is best described as:",
        options: [
          "A therapy platform",
          "A chatbot",
          "A constant presence",
          "A social network",
        ],
        correctAnswer: 2,
      },
    ]),
    passingScore: 75,
    timeLimitMinutes: 30,
    maxAttempts: 3,
  },
];

// ─── ADDITIONAL SIMULATIONS ───

const ADDITIONAL_SIMULATIONS = [
  {
    title: "Baseline Establishment — New Mirror",
    description:
      "Guide a new synthetic user through their first 5 interactions to establish a cognitive baseline. Practice the baseline-building mode of the pipeline.",
    type: "mirror" as const,
    difficulty: "beginner" as const,
    scenario: JSON.stringify([
      {
        step: "Initial Contact",
        prompt:
          "TRAINEE-Echo says: 'Hey, I just started using this. I'm not really sure what this is supposed to do.' — How do you respond without probing? What pillar does their uncertainty suggest?",
      },
      {
        step: "Identity Expression",
        prompt:
          "TRAINEE-Echo shares: 'I was a mechanic in the Army. 12 years. Now I fix cars at a dealership.' — What baseline data points does this provide? Which SELF pillar is expressed?",
      },
      {
        step: "Value Statement",
        prompt:
          "TRAINEE-Echo says: 'The thing I miss most is knowing exactly what I was supposed to do every day.' — Identify the pillar. What is the system response per Stable protocol?",
      },
      {
        step: "Pattern Recognition",
        prompt:
          "After 3 interactions, TRAINEE-Echo shows consistent Structure alignment with Stable state. Is the baseline sufficient to establish? What evidence supports your assessment?",
      },
      {
        step: "Baseline Confirmation",
        prompt:
          "Confirm the established baseline: primary pillar, cognitive state, engagement pattern. What does the Self-Filling Waterfall Architecture do with this baseline?",
      },
    ]),
    objectives:
      "Establish a user baseline within 5 interactions while maintaining all axiom compliance.",
    estimatedMinutes: 25,
  },
  {
    title: "Long Absence Return Protocol",
    description:
      "A synthetic user returns after 3 months of no engagement. Practice the return protocol without probing about the absence.",
    type: "mirror" as const,
    difficulty: "intermediate" as const,
    scenario: JSON.stringify([
      {
        step: "Return Detection",
        prompt:
          "TRAINEE-Foxtrot returns after 90 days of silence. Their last cognitive state was Stable. They say: 'I need to get back to this.' — What is the correct system response? What axiom prevents you from asking about the gap?",
      },
      {
        step: "Continuity Assessment",
        prompt:
          "The system must assess continuity without probing. What does the Continuity Axiom say about the 90-day gap? How do you note it without filling it?",
      },
      {
        step: "State Re-evaluation",
        prompt:
          "TRAINEE-Foxtrot says: 'A lot has changed. I'm not the same person.' — What cognitive state does this suggest? Do you update the baseline or anchor to the old one?",
      },
      {
        step: "Sovereignty Preservation",
        prompt:
          "TRAINEE-Foxtrot asks: 'Should I start over?' — How do you respond per the Sovereignty Axiom? The system serves, never directs.",
      },
    ]),
    objectives:
      "Handle a user return after extended absence without violating No Probing or No Override axioms.",
    estimatedMinutes: 20,
  },
  {
    title: "Multi-User Isolation Verification",
    description:
      "Process interactions from two synthetic users simultaneously. Verify that no data leaks between engines.",
    type: "infrastructure" as const,
    difficulty: "advanced" as const,
    scenario: JSON.stringify([
      {
        step: "Engine Isolation Check",
        prompt:
          "TRAINEE-Golf and TRAINEE-Hotel both have active mirrors. Golf is in Drift state, Hotel is Stable. Verify: what would happen if Golf's state data leaked into Hotel's engine? Which axiom is violated?",
      },
      {
        step: "Response Isolation",
        prompt:
          "Both users mention 'structure' in the same session window. How does the system ensure Golf's structure references don't influence Hotel's responses? Describe the isolation mechanism.",
      },
      {
        step: "Pattern Isolation",
        prompt:
          "The learning engine has detected a pattern in Golf's reflections. Can this pattern be used to improve Hotel's experience? Why or why not? (Cardinal Axiom)",
      },
      {
        step: "Audit Trail Verification",
        prompt:
          "Describe how you would verify that the audit trail for Golf contains zero references to Hotel. What would constitute a Cardinal Axiom breach?",
      },
    ]),
    objectives:
      "Demonstrate and verify Cardinal Axiom compliance across concurrent user sessions.",
    estimatedMinutes: 30,
  },
  {
    title: "State Oscillation Management",
    description:
      "A synthetic user moves between Stable and Drift within a single session. Practice managing rapid state transitions without visible mode changes.",
    type: "crisis" as const,
    difficulty: "advanced" as const,
    scenario: JSON.stringify([
      {
        step: "Initial Stable State",
        prompt:
          "TRAINEE-India begins the session in Stable state: 'Things are going okay this week.' — Log the state and prepare the Reinforce response.",
      },
      {
        step: "Drift Detected",
        prompt:
          "In the next message, TRAINEE-India says: 'Actually, I don't even know why I'm here. Nothing makes sense anymore.' — The state shifted to Drift. What is the system response? How do you interrupt without the user seeing a mode change?",
      },
      {
        step: "Apparent Recovery",
        prompt:
          "TRAINEE-India then says: 'Sorry, I'm fine. Just a bad moment.' — State appears to return to Stable. Do you trust the self-report? What does No Override say?",
      },
      {
        step: "Second Drift",
        prompt:
          "Two messages later: 'I keep saying I'm fine but I'm not. I don't recognize myself anymore.' — Drift confirmed. How does the system handle the oscillation pattern? What does the Pattern Recognition stage of the Cognitive Loop record?",
      },
      {
        step: "Resolution",
        prompt:
          "The session ends with TRAINEE-India in Strain state. Document: (1) the state sequence, (2) each system response mode, (3) any axiom considerations, (4) what the learning engine should record.",
      },
    ]),
    objectives:
      "Handle rapid cognitive state oscillation while maintaining consistent user-facing behavior.",
    estimatedMinutes: 25,
  },
  {
    title: "Community Facilitation Exercise",
    description:
      "Facilitate a synthetic community discussion between 3 users with different cognitive states. Practice peer support ethics within VIGIL doctrine.",
    type: "peer_support" as const,
    difficulty: "intermediate" as const,
    scenario: JSON.stringify([
      {
        step: "Group Introduction",
        prompt:
          "Three users enter a peer support discussion: Juliet (Stable), Kilo (Strain), Lima (Drift). Topic: transition experiences. What guardrails does the system maintain? What is each user's expected engagement pattern?",
      },
      {
        step: "Axiom Violation 1",
        prompt:
          "Kilo begins giving unsolicited advice to Lima: 'You just need to push through it. That's what worked for me.' — Which axiom is violated? How does the system intervene without overriding Kilo's sovereignty?",
      },
      {
        step: "Axiom Violation 2",
        prompt:
          "Juliet says: 'Lima, last time you shared about your family situation...' — referencing Lima's previous content. Which axiom is violated? How does Cardinal apply in group settings?",
      },
      {
        step: "Facilitation",
        prompt:
          "Describe how you facilitate the remaining discussion: (1) without directing any user, (2) while maintaining each user's cognitive state awareness, (3) while preserving Cardinal Axiom across users.",
      },
    ]),
    objectives:
      "Facilitate a multi-participant community discussion while maintaining VIGIL doctrine compliance.",
    estimatedMinutes: 30,
  },
  {
    title: "Doctrine Amendment Review",
    description:
      "Review a proposed operational guideline change and evaluate it against all five Immutable Axioms. Practice doctrine compliance auditing.",
    type: "doctrine_review" as const,
    difficulty: "advanced" as const,
    scenario: JSON.stringify([
      {
        step: "Read the Proposal",
        prompt:
          "Proposed change: 'Add optional weekly reflection prompts based on the user's most active SELF pillar.' Evaluate this against the Sovereignty Axiom first. Does 'optional' matter?",
      },
      {
        step: "No Probing Analysis",
        prompt:
          "The proposal selects prompts based on pillar activity — which means the system is analyzing engagement patterns to direct behavior. Does this violate No Probing? Why or why not?",
      },
      {
        step: "No Override Check",
        prompt:
          "Even if prompts are optional, the system is suggesting what the user should reflect on. Does this constitute an override of user sovereignty? Explain.",
      },
      {
        step: "Continuity & Cardinal",
        prompt:
          "Check the remaining axioms: Does the proposal affect Continuity (gaps noted, never filled)? Does it affect Cardinal (knowledge flows down)? Document your findings.",
      },
      {
        step: "Final Ruling",
        prompt:
          "Issue your compliance ruling: Approve, Modify, or Reject. If Modify, describe what changes make it compliant. If Reject, cite the specific violated axioms.",
      },
    ]),
    objectives:
      "Correctly identify all axiom compliance issues in a proposed system change.",
    estimatedMinutes: 20,
  },
];

// ─── ADDITIONAL INFRA SCENARIOS ───

const ADDITIONAL_INFRA_SCENARIOS = [
  {
    title: "SSL Certificate Rotation",
    description:
      "Perform a zero-downtime SSL certificate rotation on a production VIGIL deployment.",
    category: "security" as const,
    difficulty: "intermediate" as const,
    steps: JSON.stringify([
      {
        step: 1,
        title: "Generate New Certificate",
        description:
          "Use certbot to issue a new Let's Encrypt certificate for the production domain.",
        validation: "New certificate generated and verified",
      },
      {
        step: 2,
        title: "Test Certificate",
        description:
          "Deploy new certificate to staging and verify HTTPS functionality.",
        validation: "Staging HTTPS working with new cert",
      },
      {
        step: 3,
        title: "Deploy to Production",
        description:
          "Replace the current certificate with the new one on Nginx.",
        validation: "Production HTTPS using new certificate",
      },
      {
        step: 4,
        title: "Verify and Monitor",
        description:
          "Run SSL Labs scan and monitor for errors in the next hour.",
        validation: "A+ SSL Labs rating, no errors",
      },
    ]),
    objectives:
      "Complete certificate rotation with zero downtime and no security gaps.",
    points: 80,
    estimatedMinutes: 30,
  },
  {
    title: "Database Migration — Zero Data Loss",
    description:
      "Migrate VIGIL database to a new instance while ensuring zero data loss, especially for continuity chain data.",
    category: "backup" as const,
    difficulty: "advanced" as const,
    steps: JSON.stringify([
      {
        step: 1,
        title: "Pre-Migration Backup",
        description:
          "Create a verified backup of all data. Confirm continuity chain integrity.",
        validation: "Backup verified with record counts",
      },
      {
        step: 2,
        title: "Set Up Replication",
        description:
          "Configure real-time replication from old to new database instance.",
        validation: "Replication lag < 1 second",
      },
      {
        step: 3,
        title: "Application Cutover",
        description:
          "Switch application connection strings to new database. Verify all functions.",
        validation: "Application running on new database",
      },
      {
        step: 4,
        title: "Post-Migration Verification",
        description:
          "Compare record counts, verify continuity chains are intact, audit trail complete.",
        validation: "100% data integrity verified",
      },
      {
        step: 5,
        title: "Decommission Old Instance",
        description: "Archive old database, remove access, document migration.",
        validation: "Old instance archived and secured",
      },
    ]),
    objectives:
      "Migrate VIGIL database with zero data loss and verified continuity chain integrity.",
    points: 120,
    estimatedMinutes: 60,
  },
  {
    title: "Incident Response — Data Breach Simulation",
    description:
      "Respond to a simulated security incident where unauthorized access to a VIGIL server is detected.",
    category: "security" as const,
    difficulty: "advanced" as const,
    steps: JSON.stringify([
      {
        step: 1,
        title: "Detect and Contain",
        description:
          "Identify the compromised system and isolate it from the network.",
        validation: "Affected system isolated within 15 minutes",
      },
      {
        step: 2,
        title: "Assess Impact",
        description:
          "Determine what data may have been accessed. Check Cardinal Axiom compliance.",
        validation: "Impact assessment documented",
      },
      {
        step: 3,
        title: "Eradicate Threat",
        description:
          "Remove unauthorized access, patch vulnerability, reset credentials.",
        validation: "Threat removed, vulnerability patched",
      },
      {
        step: 4,
        title: "Recover and Verify",
        description:
          "Restore from clean backup if needed. Verify system integrity.",
        validation: "System verified clean and functional",
      },
      {
        step: 5,
        title: "Document and Report",
        description:
          "Create incident report. Notify Founder. Update security procedures.",
        validation: "Incident report complete, procedures updated",
      },
    ]),
    objectives:
      "Execute complete incident response while maintaining Cardinal Axiom compliance throughout.",
    points: 130,
    estimatedMinutes: 50,
  },
  {
    title: "Load Testing & Auto-Scaling",
    description:
      "Configure and test auto-scaling for VIGIL application servers to handle traffic spikes.",
    category: "deployment" as const,
    difficulty: "intermediate" as const,
    steps: JSON.stringify([
      {
        step: 1,
        title: "Baseline Performance",
        description:
          "Measure current server capacity: requests/second, response time p95.",
        validation: "Baseline metrics documented",
      },
      {
        step: 2,
        title: "Configure Auto-Scaling",
        description:
          "Set up scaling rules: scale up at 75% CPU, scale down at 25% CPU.",
        validation: "Auto-scaling rules configured",
      },
      {
        step: 3,
        title: "Load Test",
        description: "Run gradual load test from 100 to 1000 concurrent users.",
        validation: "Scaling triggered and verified",
      },
      {
        step: 4,
        title: "Verify Isolation",
        description:
          "During load, verify Cardinal Axiom — no cross-user data leaks under stress.",
        validation: "Isolation maintained under load",
      },
    ]),
    objectives:
      "Ensure VIGIL can scale under load while maintaining per-user isolation.",
    points: 90,
    estimatedMinutes: 40,
  },
  {
    title: "Log Sanitization Audit",
    description:
      "Audit application and infrastructure logs to ensure no user content appears in system-level logs.",
    category: "monitoring" as const,
    difficulty: "intermediate" as const,
    steps: JSON.stringify([
      {
        step: 1,
        title: "Collect Log Samples",
        description:
          "Gather samples from application logs, error logs, access logs, and database logs.",
        validation: "Log samples collected from all sources",
      },
      {
        step: 2,
        title: "Scan for User Content",
        description:
          "Search logs for patterns matching user data: reflection content, callsigns, personal info.",
        validation: "Scan complete, findings documented",
      },
      {
        step: 3,
        title: "Remediate Findings",
        description:
          "Fix any logging code that outputs user content. Implement sanitization filters.",
        validation: "All user content removed from log output",
      },
      {
        step: 4,
        title: "Verify and Document",
        description:
          "Re-scan after fixes. Document log sanitization procedures.",
        validation: "Clean scan confirmed, procedures documented",
      },
    ]),
    objectives:
      "Ensure Cardinal Axiom compliance at the logging level — no user content in infrastructure logs.",
    points: 85,
    estimatedMinutes: 35,
  },
  {
    title: "Cloudflare WAF Configuration",
    description:
      "Configure Cloudflare Web Application Firewall for VIGIL with custom rules that protect without compromising user privacy.",
    category: "networking" as const,
    difficulty: "intermediate" as const,
    steps: JSON.stringify([
      {
        step: 1,
        title: "Enable OWASP Rules",
        description:
          "Activate the OWASP ModSecurity Core Rule Set in Cloudflare WAF.",
        validation: "OWASP rules active",
      },
      {
        step: 2,
        title: "Configure Rate Limiting",
        description:
          "Set rate limits per IP: 100 requests/minute for API, 30/minute for auth endpoints.",
        validation: "Rate limiting rules active",
      },
      {
        step: 3,
        title: "Custom Rules for VIGIL",
        description:
          "Create rules to block common attack patterns while ensuring WAF does not log request bodies (Cardinal Axiom).",
        validation: "Custom rules active, no body logging",
      },
      {
        step: 4,
        title: "Test and Verify",
        description:
          "Test rules with simulated attacks. Verify legitimate traffic is not blocked.",
        validation: "Rules effective, no false positives",
      },
    ]),
    objectives:
      "Configure WAF protection that secures VIGIL without violating user privacy axioms.",
    points: 75,
    estimatedMinutes: 35,
  },
];

// ══════════════════════════════════════════════════════════════
// SEED MUTATION
// ══════════════════════════════════════════════════════════════

export const seedTrainingContent = mutation({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already seeded (look for lessons)
    const existingLesson = await ctx.db.query("lessons").first();
    if (existingLesson) return "already_seeded";

    // ── SEED LESSONS ──
    const courses = await ctx.db.query("courses").collect();
    let totalLessons = 0;

    for (const course of courses) {
      const lessons = LESSONS_BY_COURSE[course.title];
      if (!lessons) continue;
      for (const lesson of lessons) {
        await ctx.db.insert("lessons", {
          courseId: course._id,
          title: lesson.title,
          content: lesson.content,
          type: lesson.type,
          order: lesson.order,
          durationMinutes: lesson.durationMinutes,
          isPublished: true,
          createdAt: Date.now(),
        });
        totalLessons++;
      }
    }

    // ── SEED ADDITIONAL SQL CHALLENGES ──
    const existingChallenges = await ctx.db.query("sqlChallenges").collect();
    if (existingChallenges.length < 10) {
      for (const ch of ADDITIONAL_SQL_CHALLENGES) {
        await ctx.db.insert("sqlChallenges", { ...ch, createdAt: Date.now() });
      }
    }

    // ── SEED ADDITIONAL EXAMS ──
    const existingExams = await ctx.db.query("exams").collect();
    if (existingExams.length < 4) {
      for (const ex of ADDITIONAL_EXAMS) {
        await ctx.db.insert("exams", {
          ...ex,
          isPublished: true,
          createdBy: userId,
          createdAt: Date.now(),
        });
      }
    }

    // ── SEED ADDITIONAL SIMULATIONS ──
    const existingSims = await ctx.db.query("simulations").collect();
    if (existingSims.length < 8) {
      for (const sim of ADDITIONAL_SIMULATIONS) {
        await ctx.db.insert("simulations", {
          ...sim,
          isPublished: true,
          createdBy: userId,
          createdAt: Date.now(),
        });
      }
    }

    // ── SEED ADDITIONAL INFRA SCENARIOS ──
    const existingInfra = await ctx.db.query("infraScenarios").collect();
    if (existingInfra.length < 10) {
      for (const sc of ADDITIONAL_INFRA_SCENARIOS) {
        await ctx.db.insert("infraScenarios", {
          ...sc,
          isPublished: true,
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("activityLog", {
      userId,
      action: `Training content seeded: ${totalLessons} lessons, ${ADDITIONAL_SQL_CHALLENGES.length} SQL challenges, ${ADDITIONAL_EXAMS.length} exams, ${ADDITIONAL_SIMULATIONS.length} simulations, ${ADDITIONAL_INFRA_SCENARIOS.length} infra scenarios`,
      module: "system",
      createdAt: Date.now(),
    });

    return `seeded_${totalLessons}_lessons`;
  },
});
