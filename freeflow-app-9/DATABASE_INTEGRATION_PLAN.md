# Navigation Customization - Database Integration Plan

## Current Implementation (Phase 1 - LocalStorage) ✅

### Storage Mechanism
All navigation customization data is currently stored in browser `localStorage`:

```javascript
// Current localStorage keys
'kazi-navigation-config'          // Current navigation configuration
'kazi-navigation-presets'         // Array of saved presets
'kazi-navigation-active-preset'   // Currently active preset ID
'kazi-customization-count'        // Engagement tracking counter
'kazi-seen-customization'         // Onboarding tooltip flag
```

### Advantages
- ✅ **Zero latency**: Instant load/save
- ✅ **No backend dependency**: Works offline
- ✅ **Privacy-first**: Data stays on user's device
- ✅ **Easy debugging**: Inspect via browser DevTools

### Limitations
- ❌ **No sync across devices**: Settings don't follow the user
- ❌ **Lost on browser clear**: Data can be wiped
- ❌ **No team sharing**: Can't share presets with colleagues
- ❌ **No analytics**: Can't track aggregate usage patterns

---

## Phase 2 - Database Integration (Future Enhancement)

### Database Schema

#### Table: `user_navigation_presets`
```sql
CREATE TABLE user_navigation_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_active_per_user UNIQUE (user_id, is_active) WHERE is_active = true
);

-- Indexes for performance
CREATE INDEX idx_user_navigation_presets_user_id ON user_navigation_presets(user_id);
CREATE INDEX idx_user_navigation_presets_is_active ON user_navigation_presets(user_id, is_active);
```

#### Table: `user_navigation_analytics`
```sql
CREATE TABLE user_navigation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'preset_created', 'preset_switched', 'category_toggled', etc.
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_user_navigation_analytics_user_id_created ON user_navigation_analytics(user_id, created_at DESC);
CREATE INDEX idx_user_navigation_analytics_event_type ON user_navigation_analytics(event_type);
```

#### Table: `team_navigation_templates` (Enterprise Feature)
```sql
CREATE TABLE team_navigation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  role_type VARCHAR(50), -- 'creator', 'business', 'developer', 'custom'
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_templates_org_id ON team_navigation_templates(organization_id);
```

### Migration Strategy

#### Step 1: Hybrid Approach (Backward Compatible)
```typescript
// lib/navigation-storage.ts
export class NavigationStorage {
  private useDatabase = false; // Feature flag

  async loadPresets(userId: string): Promise<NavigationPreset[]> {
    if (this.useDatabase && userId) {
      // Load from Supabase
      const { data, error } = await supabase
        .from('user_navigation_presets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) return data;
    }

    // Fallback to localStorage
    const local = localStorage.getItem('kazi-navigation-presets');
    return local ? JSON.parse(local) : [];
  }

  async savePreset(userId: string, preset: NavigationPreset): Promise<void> {
    if (this.useDatabase && userId) {
      // Save to Supabase
      await supabase.from('user_navigation_presets').upsert({
        user_id: userId,
        name: preset.name,
        config: preset.config,
        is_active: preset.id === this.activePreset
      });

      // Track analytics
      await this.trackEvent(userId, 'preset_created', { preset_name: preset.name });
    }

    // Always save to localStorage for offline access
    const presets = await this.loadPresets(userId);
    presets.push(preset);
    localStorage.setItem('kazi-navigation-presets', JSON.stringify(presets));
  }

  private async trackEvent(userId: string, eventType: string, data: any) {
    await supabase.from('user_navigation_analytics').insert({
      user_id: userId,
      event_type: eventType,
      event_data: data
    });
  }
}
```

#### Step 2: One-Time Migration
```typescript
// migrations/migrate-navigation-to-db.ts
export async function migrateNavigationToDatabase(userId: string) {
  const migrated = localStorage.getItem('kazi-navigation-migrated');
  if (migrated) return;

  try {
    // Load all localStorage data
    const config = localStorage.getItem('kazi-navigation-config');
    const presets = localStorage.getItem('kazi-navigation-presets');
    const active = localStorage.getItem('kazi-navigation-active-preset');

    if (config || presets) {
      // Upload to database
      const parsedPresets = presets ? JSON.parse(presets) : [];

      for (const preset of parsedPresets) {
        await supabase.from('user_navigation_presets').insert({
          user_id: userId,
          name: preset.name,
          config: preset.config,
          is_active: preset.id === active
        });
      }

      // Mark as migrated
      localStorage.setItem('kazi-navigation-migrated', 'true');

      toast.success('Navigation settings synced to cloud!', {
        description: 'Your presets are now available across all devices'
      });
    }
  } catch (error) {
    console.error('Migration failed:', error);
    // Silent fail - localStorage still works
  }
}
```

### API Endpoints

#### GET `/api/navigation/presets`
```typescript
// Get user's saved presets
export async function GET(request: Request) {
  const { userId } = await getUser(request);

  const { data, error } = await supabase
    .from('user_navigation_presets')
    .select('*')
    .eq('user_id', userId);

  return Response.json({ presets: data });
}
```

#### POST `/api/navigation/presets`
```typescript
// Create new preset
export async function POST(request: Request) {
  const { userId } = await getUser(request);
  const { name, config, description } = await request.json();

  const { data, error } = await supabase
    .from('user_navigation_presets')
    .insert({
      user_id: userId,
      name,
      config,
      description
    })
    .select()
    .single();

  // Track analytics
  await trackNavigationEvent(userId, 'preset_created', { preset_id: data.id });

  return Response.json({ preset: data });
}
```

#### PUT `/api/navigation/presets/:id/activate`
```typescript
// Switch to a preset
export async function PUT(request: Request, { params }) {
  const { userId } = await getUser(request);
  const { id } = params;

  // Deactivate all presets
  await supabase
    .from('user_navigation_presets')
    .update({ is_active: false })
    .eq('user_id', userId);

  // Activate selected preset
  await supabase
    .from('user_navigation_presets')
    .update({ is_active: true })
    .eq('id', id)
    .eq('user_id', userId);

  // Track analytics
  await trackNavigationEvent(userId, 'preset_switched', { preset_id: id });

  return Response.json({ success: true });
}
```

### Analytics Queries

#### Most Popular Workflow Presets
```sql
SELECT
  event_data->>'workflow' as workflow_type,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM user_navigation_analytics
WHERE event_type = 'workflow_applied'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY workflow_type
ORDER BY usage_count DESC;
```

#### Customization Engagement Score
```sql
SELECT
  user_id,
  COUNT(*) as total_customizations,
  COUNT(DISTINCT event_type) as unique_event_types,
  MAX(created_at) as last_customization
FROM user_navigation_analytics
WHERE user_id = $1
GROUP BY user_id;
```

#### Preset Switching Patterns
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as switches
FROM user_navigation_analytics
WHERE event_type = 'preset_switched'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

---

## Implementation Timeline

### Phase 1: LocalStorage (COMPLETED ✅)
- ✅ Basic customization with localStorage
- ✅ Preset management
- ✅ Quick workflow presets
- ✅ Client-side analytics tracking

### Phase 2: Database Integration (4 weeks)
**Week 1: Schema & Migration**
- Create database tables
- Build migration script
- Add feature flag

**Week 2: Backend API**
- Implement REST endpoints
- Add analytics tracking
- Test synchronization

**Week 3: Frontend Integration**
- Update storage layer
- Add sync indicators
- Handle offline mode

**Week 4: Testing & Rollout**
- QA testing
- Gradual rollout (10% → 50% → 100%)
- Monitor performance

### Phase 3: Advanced Features (8 weeks)
- Team templates
- Preset marketplace
- AI-recommended layouts
- Usage insights dashboard

---

## Performance Considerations

### Caching Strategy
```typescript
// Cache presets in memory for 5 minutes
const presetCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function getCachedPresets(userId: string) {
  const cached = presetCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const presets = await fetchPresetsFromDB(userId);
  presetCache.set(userId, { data: presets, timestamp: Date.now() });
  return presets;
}
```

### Optimistic UI Updates
```typescript
async function savePreset(preset: NavigationPreset) {
  // Update UI immediately
  setPresets(prev => [...prev, preset]);
  toast.success('Preset saved!');

  try {
    // Save to database in background
    await api.savePreset(preset);
  } catch (error) {
    // Revert on failure
    setPresets(prev => prev.filter(p => p.id !== preset.id));
    toast.error('Failed to save preset');
  }
}
```

---

## Security & Privacy

### Row-Level Security (RLS)
```sql
-- Users can only access their own presets
CREATE POLICY "Users can view own presets"
  ON user_navigation_presets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets"
  ON user_navigation_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
  ON user_navigation_presets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON user_navigation_presets
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Data Encryption
- Preset configs stored as JSONB (encrypted at rest by Supabase)
- Analytics events anonymized after 90 days
- User consent required for analytics

---

## Success Metrics

### Technical Metrics
- API response time < 100ms (p95)
- Sync success rate > 99.9%
- Zero data loss during migration

### Product Metrics
- 40%+ of users create at least 1 custom preset
- 25%+ of users have 3+ presets
- 80%+ retention lift for users with saved presets

### Business Metrics
- 15% increase in DAU/MAU ratio
- 20% decrease in "where is X feature" support tickets
- 2x engagement with premium features

---

**Current Status**: Phase 1 Complete ✅
**Next Steps**: Database schema design & migration planning
**Timeline**: Q1 2025 for Phase 2 rollout
