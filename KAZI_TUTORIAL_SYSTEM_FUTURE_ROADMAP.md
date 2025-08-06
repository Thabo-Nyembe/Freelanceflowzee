# KAZI Interactive Tutorial System  
## Future Roadmap (Q4 2025 → 2026)

---

### 1 | Executive Summary
The current tutorial system delivers guided onboarding, achievements and analytics.  
To maintain market leadership, KAZI will layer four advanced capabilities:

| # | Initiative | Goal | Target GA |
|---|------------|------|-----------|
| 1 | Step-level A/B Testing | Optimise funnel conversion per step | 2025-11 |
| 2 | Adaptive Tutorials (Persona Clustering) | Personalise paths → +7 pp retention | 2026-01 |
| 3 | Mobile Onboarding (React Native) | Parity on iOS / Android | 2026-03 |
| 4 | Post-Tutorial In-Product Surveys | Continuous feedback loop | 2026-04 |

Combined uplift forecast: **+$1.8 M ARR** and **-22 % churn** within 12 months.

---

### 2 | Global Architectural Add-Ons
```
[Client (Web / RN)]        ─┐
                            │ analytics + survey SDK
┌────────┐ Launch API  ┌───────────────┐
│ Admin  │────────────►│ Tutorial Core │──┐
└────────┘             └───────────────┘  │ event bus
             ▲ experiments API            ▼
          ┌───────────────┐        ┌───────────────┐
          │  Experiment   │◄──────►│  Analytics +  │
          │  Service      │        │  Persona Svc  │
          └───────────────┘        └───────────────┘
                │AB data                │clusters
                ▼                       ▼
             Supabase / Feature Flags / Segment
```
(The new blocks are *Experiment Service*, *Persona Service* and *Survey SDK*.)

---

### 3 | Initiative-by-Initiative Detail

#### 3.1  Step-level A/B Testing
*Objective* Increase tutorial completion from **78 % → 84 %**.  

Technical spec  
• Service: `@kazi/experiments` (Next.js API + Supabase table `tutorial_experiments`)  
• Assignment: Deterministic (userId % variantCount) with override via feature flag  
• Metrics: completion rate, avg-time-per-step, drop-off cause  
• SDK additions: `useStepExperiment(stepId)` hook (web & RN)  

Phases  
| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| 0 – Design | Sep-2025 | Metrics schema, bucketing algorithm |
| 1 – Alpha  | Oct-2025 | Hard-coded variants on Welcome Tour |
| 2 – Beta   | Nov-2025 | UI for experiment setup, live dashboards |
| **GA**     | Nov-2025 | Rollout across all tutorials |

KPI Targets (roll-up)  
* +6 pp completion, +3 pp Day-7 retention, +$0.6 M ARR.

---

#### 3.2  Adaptive Tutorials via Persona Clustering
*Objective* Deliver context-aware flows; new users finish faster, pros skip basics.  

Technical spec  
• Daily batch job in Supabase Edge Functions runs k-means on user events  
• Persona schema: `newbie`, `freelancer-pro`, `team-manager`, `ai-power`  
• Real-time path selection: Tutorial engine reads persona and serves variant JSON  
• ML toolkit: `turso` + pgvector extension (already enabled)  

Phases  
| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| Discovery | Oct-2025 | Data audit, event taxonomy |
| Model MVP | Nov-2025 | v1 clustering, accuracy dashboard |
| Pilot | Dec-2025 | 10 % traffic (opt-in) |
| **GA** | Jan-2026 | All users with fallbacks |

Business impact: +4 pp retention, −8 % support tickets, +$0.5 M ARR.

---

#### 3.3  Mobile Onboarding (React Native)
*Objective* Replicate tutorial experience inside the upcoming KAZI mobile app.  

Technical spec  
• RN package `@kazi/tutorial-rn` – expo-compatible, 100 % TypeScript  
• Same Launch API, variant selection via `/tutorial-config` endpoint  
• Offline mode: local Realm cache & replay when online  
• CI: Detox tests + device farm  

Phases  
| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| SDK Core | Dec-2025 | Overlay engine, “hand-pointer” animations |
| Parity v1 | Jan-2026 | Welcome, Projects, Feedback tutorials |
| Beta | Feb-2026 | Achievements & analytics wiring |
| **GA** | Mar-2026 | Full parity + iOS/Android store release |

Impact: +25 k mobile MAU, +$0.4 M ARR.

---

#### 3.4  Post-Tutorial In-Product Surveys
*Objective* Capture NPS & feature-discovery insights immediately after tutorial completion.  

Technical spec  
• Lightweight micro-front `SurveyPopover` triggered by engine  
• Responses stored in Supabase `tutorial_surveys`, auto-export to Segment → BI  
• Logic: max 1 survey per 30 days / user, 2-step UX (emoji NPS → free-text)  

Phases  
| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| Spec & UX | Feb-2026 | Survey templates, throttle logic |
| Build | Mar-2026 | API + front-end widget |
| **GA** | Apr-2026 | Dashboard integration, auto-tag Jira tickets |

Expected outcome: +15 % qualitative feedback volume, faster roadmap validation.

---

### 4 | Consolidated Timeline (2025-Q4 → 2026-Q2)
| Month | Milestones |
|-------|------------|
| Sep 25 | Experiment design specs complete |
| Oct 25 | A/B Alpha; Persona data audit |
| Nov 25 | A/B GA; Persona model MVP |
| Dec 25 | Adaptive Pilot; Mobile SDK core |
| Jan 26 | Adaptive GA; Mobile parity v1 |
| Feb 26 | Mobile Beta; Survey UX spec |
| Mar 26 | Mobile GA; Survey build |
| Apr 26 | Surveys GA & dashboard |

---

### 5 | Resources & Budget
| Role | FTE | Duration | Cost |
|------|-----|----------|------|
| Senior FE (Web/RN) | 2 | 7 mo | $280 k |
| Data Scientist | 1 | 4 mo | $120 k |
| Backend Engineer | 1 | 6 mo | $150 k |
| PM / UX | 0.5 | 7 mo | $70 k |
| QA / DevOps | 0.5 | 7 mo | $60 k |
| **Total** | **5 FTE** | **$680 k** |

ROI breakeven at ~9 months post-GA.

---

### 6 | Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data sparsity for clustering | Med | Inaccurate personas | Seed model with rule-based heuristics |
| Mobile release delays | Med | ARR slip | Parallel dev tracks, shared core logic |
| Experiment fatigue | Low | User annoyance | 2 concurrent tests max, variant caps |
| Survey spam perception | Low | Lower NPS | Throttle & contextual trigger rules |

---

### 7 | KPIs & Success Criteria
* A/B: step completion Δ ≥ +6 pp  
* Adaptive: Day-7 retention ≥ 85 % for targeted personas  
* Mobile: ≥ 30 % of daily tutorials consumed on RN app  
* Surveys: ≥ 25 % response rate, NPS ≥ +45  

---

### 8 | Next Actions
1. Kick-off workshop – align eng/PM/design (14 Sep 2025).  
2. Finalise event taxonomy & analytics contract.  
3. Spin up `@kazi/experiments` micro-service repo.  
4. Draft UX for survey widget and RN overlays.

---

**Prepared by:** KAZI Product & Engineering – Aug 2025  
*Living document – update on Sprint boundaries*
