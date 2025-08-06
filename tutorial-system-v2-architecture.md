# Tutorial System V2 Architecture Specification

*Version 0.9 · Aug 2025*  
_This document standardises the **advanced** capabilities planned for the KAZI Interactive Tutorial System scheduled for Q4 2025‒2026. It must be read together with the existing V1 spec._

---

## 1 Overview

The V2 system adds:

1. Step-level **A/B testing** of tutorial steps  
2. **Adaptive tutorials** selected by a **persona clustering** model  
3. **React-Native** client parity with offline support  
4. Post-tutorial **in-product surveys**

These operate on top of the current Launch API.  
The diagram shows the new moving parts (blue):

```
 Web & RN Clients               Next.js (Edge Runtime)                Data / ML
┌────────────────┐        ┌──────────────────────────────┐        ┌────────────────┐
│  UI Overlay    │        │  /api/tutorial/**            │        │  Supabase DB   │
│  RN Overlay    │──┐  ┌─►│  launch • config • stepPing  │        │  + pgvector    │
└────────────────┘  │  │  └──────────────────────────────┘        └────────────────┘
                    │  │            ▲        ▲      ▲
                    │  │ ExperSvc   │        │MLSvc │
                    │  └────────────┘        │      │Nightly batch
                    ▼                       ▼      ▼
              Segment Events        Experiment   Persona clusters
                                     table
```

---

## 2 API Contracts (REST + Edge Functions)

### 2.1 `GET /api/tutorial/config`

Returns **client-ready JSON** containing:
* chosen variant id (`"v1_control"`, `"v1_short"`, …)
* persona (`"newbie" | "freelancer-pro" | …`)
* ordered step array

```json
{
  "tutorialId": "welcome-tour",
  "persona": "newbie",
  "variant": "v1_control",
  "steps": [
    { "id": "intro", "title": "Welcome", "cta": "Next" },
    { "id": "dashboard", "title": "Dash Overview", "cta": "Try it" }
  ],
  "expires": "2025-11-19T14:33:00Z"
}
```

Headers  
`Authorization: Bearer <JWT>` (optional anonymous)  
`x-kazi-device: web|ios|android`

### 2.2 `POST /api/tutorial/step`

Body → `{ tutorialId, stepId, status:"started|completed", t:ms }`  
Persist to `tutorial_step_events` (see schema).  
Returns `204`.

### 2.3 Experiment Service (internal)

```
POST /_internal/experiments/assign
{ "userId": "...", "experimentId": "welcome-v1" }
→ 200 { "variant": "v1_short" }
```

Idempotent hash algorithm keeps assignment stable.

### 2.4 Persona Service (internal)

```
GET /_internal/persona/:userId
→ 200 { "persona": "team-manager", "confidence": 0.82 }
```

Edge-cached 10 min.

### 2.5 Survey API

```
POST /api/tutorial/survey
{ tutorialId, nps: 9, comment: "Loved it", persona }
→ 201
```

Rate-limited (1 / 30 days / user).

---

## 3 Database / Storage Schemas (PostgreSQL + pgvector)

```sql
-- 3.1 Experiments
create table tutorial_experiments (
  id text primary key,
  tutorial_id text not null,
  name text,
  status text check (status in ('draft','running','completed')),
  created_at timestamptz default now()
);

create table tutorial_variants (
  id text primary key,
  experiment_id text references tutorial_experiments(id) on delete cascade,
  name text,
  weight int check (weight between 1 and 100) default 50
);

create table tutorial_assignments (
  user_id uuid,
  experiment_id text,
  variant_id text,
  assigned_at timestamptz default now(),
  primary key(user_id, experiment_id)
);

-- 3.2 Step events
create table tutorial_step_events (
  id bigserial primary key,
  user_id uuid,
  tutorial_id text,
  step_id text,
  variant_id text,
  persona text,
  status text,          -- started/completed
  duration_ms int,
  created_at timestamptz default now()
);

-- 3.3 Personas (vector for clustering)
create extension if not exists vector;
create table user_personas (
  user_id uuid primary key,
  persona text,
  embedding vector(32),          -- pgvector
  confidence numeric,
  updated_at timestamptz default now()
);

-- 3.4 Surveys
create table tutorial_surveys (
  id bigserial primary key,
  user_id uuid,
  tutorial_id text,
  nps int check (nps between 0 and 10),
  comment text,
  persona text,
  created_at timestamptz default now()
);
```

Indices  
`create index on tutorial_step_events (tutorial_id, step_id, status);`  
`create index on tutorial_step_events (variant_id);`  

---

## 4 A/B Testing Infrastructure

### 4.1 Assignment Algorithm (TypeScript)

```ts
import xxhash from 'xxhash-wasm';

export function assignVariant(userId: string, variants: {id:string; weight:number}[]) {
  const hash = xxhash.h32(userId, 0) % 100;
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (hash < cumulative) return v.id;
  }
  return variants[0].id;            // fallback
}
```

Stored in `tutorial_assignments` for analytics parity.

### 4.2 Experiment Lifecycle

1. PM creates experiment in Admin → writes row to `tutorial_experiments` & variants  
2. When status = `running`, Assignment service exposes it  
3. Completion calculation via Supabase **realtime materialised view**  

---

## 5 ML-Driven Persona Clustering

### 5.1 Edge Function (`supabase functions deploy personas`)

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import kmeans from 'npm:kmeans-js';

export const handler = async () => {
  const db = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SERVICE_ROLE'));
  const { data: events } = await db.rpc('get_persona_training_dataset');
  const vectors = events.map(e => e.embedding);
  const { centroids, labels } = kmeans(vectors, 4);

  // Write labels
  await Promise.all(events.map((e, i) =>
    db.from('user_personas')
      .upsert({ user_id: e.user_id, persona: labelToName(labels[i]), embedding: e.embedding })
  ));
};
```

Nightly cron triggers; small per-user `vector(32)` fits plan.

### 5.2 `labelToName()`

| Cluster | Persona | Heuristic |
|---------|---------|-----------|
| 0 | *newbie* | few events, long time-to-first-value |
| 1 | *freelancer-pro* | solo projects, high AI usage |
| 2 | *team-manager* | invites > 3 users, uses PM features |
| 3 | *ai-power* | ≥ 30 AI calls / day |

---

## 6 React Native Integration

### 6.1 Package `@kazi/tutorial-rn`

Exported hooks:

```ts
export function useTutorial(tutorialId: string) {
  const { data } = useQuery(['tutorial', tutorialId], fetchConfig);
  const [step, setStep] = useState(0);

  const next = () => {
    ping('completed', stepId);
    setStep(s => s + 1);
    ping('started', nextStepId);
  };

  return { config: data, step, next };
}
```

### 6.2 Offline Mode

* Config cached in `AsyncStorage` (key `tutorialCfg:<id>:<etag>`)  
* Step pings queued into SQLite; flushed when connectivity returns  
* Background sync via Expo TaskManager every 15 min  

### 6.3 Native Modules

* iOS – Swift overlay using `UIViewPropertyAnimator`  
* Android – Kotlin view with MotionLayout  
Both expose the same JS bridge: `showOverlay(props)`.

---

## 7 Integration Patterns

| Path | Pattern |
|------|---------|
| Analytics | All step events → Segment → BigQuery |
| Feature Flags | LaunchDarkly flag `tutorial.v2_enabled` gates the new engine |
| Event Bus | Internal **NATS** topic `tutorial.events` for cross-service comms |
| Monitoring | Prometheus counters `tutorial_step_events_total{status,step}` |

---

## 8 Security & Privacy

* All APIs require user JWT; internal endpoints require `role=service`.  
* PII (comments) stored encrypted at rest.  
* Persona embeddings are non-reversible numeric vectors.  
* Surveys anonymised in analytics exports.

---

## 9 Migration Plan

1. **Schema-first**: deploy new tables with zero impact  
2. Release Launch API v2 with *shadow* serving under `/v2/tutorial/config`  
3. White-list internal traffic for RN beta  
4. Switch 5 % web users to engine v2 behind flag  
5. Full cut-over when metrics ≥ baseline

Rollback: toggle flag, keep dual writes for step events 2 weeks.

---

## 10 Open Questions

1. Do we need **per-persona** experiment weights?  
2. Should surveys support mandatory follow-up?  
3. RN offline XP sync conflict resolution strategy?

---

**Author:** KAZI Architecture Guild  
Please raise PRs against this document for any change requests.
