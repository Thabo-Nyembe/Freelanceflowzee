-- Seller Levels & Gamification System - FreeFlow A+++ Implementation
-- Based on Fiverr/Upwork seller ranking systems

-- ============================================
-- ENUMS
-- ============================================

-- Seller level tiers (like Fiverr's New Seller → Top Rated Seller)
CREATE TYPE seller_level_tier AS ENUM (
  'new_seller',        -- Just joined, building reputation
  'rising_talent',     -- Showing promise, good early metrics
  'level_1',           -- Established seller
  'level_2',           -- Experienced seller
  'top_rated',         -- Excellent track record
  'pro'                -- Verified professional (manual vetting)
);

-- Badge categories
CREATE TYPE badge_category AS ENUM (
  'achievement',       -- Milestones (first sale, 100 orders, etc.)
  'skill',            -- Skill verification badges
  'quality',          -- Quality-based badges
  'speed',            -- Delivery speed badges
  'communication',    -- Response time badges
  'special',          -- Special event or promo badges
  'verified'          -- Identity/skill verification badges
);

-- Achievement types
CREATE TYPE achievement_type AS ENUM (
  'orders_completed',
  'revenue_earned',
  'repeat_clients',
  'five_star_reviews',
  'on_time_delivery',
  'quick_response',
  'zero_cancellation',
  'perfect_month',
  'client_favorite',
  'skill_certified',
  'identity_verified',
  'portfolio_complete',
  'profile_complete'
);

-- ============================================
-- TABLES
-- ============================================

-- Seller Level Definitions (configurable tiers)
CREATE TABLE seller_level_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier seller_level_tier UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  description TEXT,
  icon_url TEXT,
  color VARCHAR(20) DEFAULT '#4F46E5',

  -- Requirements to achieve this level
  min_orders INTEGER DEFAULT 0,
  min_earnings DECIMAL(12,2) DEFAULT 0,
  min_rating DECIMAL(3,2) DEFAULT 0,
  min_on_time_rate DECIMAL(5,2) DEFAULT 0,
  min_response_rate DECIMAL(5,2) DEFAULT 0,
  min_completion_rate DECIMAL(5,2) DEFAULT 0,
  min_days_active INTEGER DEFAULT 0,
  min_repeat_buyer_rate DECIMAL(5,2) DEFAULT 0,

  -- Benefits at this level
  commission_discount DECIMAL(5,2) DEFAULT 0, -- Percentage discount on platform fee
  featured_priority INTEGER DEFAULT 0,        -- Higher = more visibility
  max_active_gigs INTEGER DEFAULT 7,
  can_offer_custom_quotes BOOLEAN DEFAULT FALSE,
  can_use_promoted_gigs BOOLEAN DEFAULT FALSE,
  support_priority VARCHAR(20) DEFAULT 'standard', -- standard, priority, vip

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller Statistics (real-time metrics)
CREATE TABLE seller_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Current level
  current_level seller_level_tier DEFAULT 'new_seller',
  level_achieved_at TIMESTAMPTZ DEFAULT NOW(),
  next_evaluation_at TIMESTAMPTZ,

  -- Order metrics
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  active_orders INTEGER DEFAULT 0,

  -- Financial metrics
  total_earnings DECIMAL(14,2) DEFAULT 0,
  earnings_this_month DECIMAL(14,2) DEFAULT 0,
  earnings_last_30_days DECIMAL(14,2) DEFAULT 0,
  average_order_value DECIMAL(12,2) DEFAULT 0,

  -- Quality metrics
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  five_star_reviews INTEGER DEFAULT 0,
  four_star_reviews INTEGER DEFAULT 0,
  positive_review_rate DECIMAL(5,2) DEFAULT 0, -- 4-5 stars / total

  -- Performance metrics
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 100,
  response_rate DECIMAL(5,2) DEFAULT 100,
  response_time_hours DECIMAL(6,2) DEFAULT 0, -- Average response time
  order_completion_rate DECIMAL(5,2) DEFAULT 100,

  -- Client metrics
  unique_clients INTEGER DEFAULT 0,
  repeat_clients INTEGER DEFAULT 0,
  repeat_buyer_rate DECIMAL(5,2) DEFAULT 0,

  -- Activity metrics
  days_since_joined INTEGER DEFAULT 0,
  days_active_last_30 INTEGER DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  last_delivery_date TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  -- Warnings/issues
  warnings_count INTEGER DEFAULT 0,
  has_active_warning BOOLEAN DEFAULT FALSE,
  account_health_score INTEGER DEFAULT 100, -- 0-100

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller Level History (track promotions/demotions)
CREATE TABLE seller_level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  previous_level seller_level_tier,
  new_level seller_level_tier NOT NULL,
  change_type VARCHAR(20) NOT NULL, -- 'promotion', 'demotion', 'initial'
  reason TEXT,

  -- Snapshot of metrics at time of change
  metrics_snapshot JSONB,

  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge Definitions
CREATE TABLE badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category badge_category NOT NULL,

  -- Visual
  icon_url TEXT,
  icon_name VARCHAR(50), -- For lucide icons
  color VARCHAR(20) DEFAULT '#4F46E5',

  -- Requirements
  achievement_type achievement_type,
  threshold INTEGER, -- e.g., 100 for "100 Orders Completed"

  -- Display
  is_public BOOLEAN DEFAULT TRUE,
  is_rare BOOLEAN DEFAULT FALSE,
  rarity_percentage DECIMAL(5,2), -- % of sellers who have this

  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  unlocks_feature TEXT, -- Feature unlocked by this badge

  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges (earned badges)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badge_definitions(id) ON DELETE CASCADE NOT NULL,

  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_reason TEXT,

  -- Optional expiration (for time-limited badges)
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN DEFAULT FALSE,

  -- Display preference
  is_featured BOOLEAN DEFAULT FALSE, -- User chooses to feature this
  display_order INTEGER DEFAULT 0,

  UNIQUE(user_id, badge_id)
);

-- Seller XP & Leveling (gamification)
CREATE TABLE seller_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,

  -- XP breakdown
  xp_from_orders INTEGER DEFAULT 0,
  xp_from_reviews INTEGER DEFAULT 0,
  xp_from_badges INTEGER DEFAULT 0,
  xp_from_profile INTEGER DEFAULT 0,
  xp_from_activity INTEGER DEFAULT 0,

  -- Streaks
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  streak_multiplier DECIMAL(3,2) DEFAULT 1.0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP Transactions (audit trail)
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  xp_amount INTEGER NOT NULL,
  xp_type VARCHAR(50) NOT NULL, -- 'order', 'review', 'badge', 'streak', etc.
  description TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements (for tracking progress toward badges)
CREATE TABLE seller_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type achievement_type NOT NULL,

  current_progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, achievement_type)
);

-- Level Requirements Log (for transparency)
CREATE TABLE level_evaluation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  current_level seller_level_tier NOT NULL,
  metrics JSONB NOT NULL,
  requirements JSONB NOT NULL,
  eligible_for_next BOOLEAN DEFAULT FALSE,
  missing_requirements TEXT[],

  result VARCHAR(20) NOT NULL -- 'maintain', 'promote', 'demote', 'pending_review'
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_seller_stats_user ON seller_statistics(user_id);
CREATE INDEX idx_seller_stats_level ON seller_statistics(current_level);
CREATE INDEX idx_seller_stats_rating ON seller_statistics(average_rating DESC);
CREATE INDEX idx_seller_stats_earnings ON seller_statistics(total_earnings DESC);
CREATE INDEX idx_seller_stats_orders ON seller_statistics(completed_orders DESC);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_featured ON user_badges(user_id, is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_seller_level_history_user ON seller_level_history(user_id);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_seller_achievements_user ON seller_achievements(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Calculate seller level based on metrics
CREATE OR REPLACE FUNCTION calculate_seller_level(p_user_id UUID)
RETURNS seller_level_tier AS $$
DECLARE
  v_stats seller_statistics%ROWTYPE;
  v_level seller_level_tier := 'new_seller';
  v_def RECORD;
BEGIN
  -- Get seller statistics
  SELECT * INTO v_stats FROM seller_statistics WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN 'new_seller';
  END IF;

  -- Check each level from highest to lowest
  FOR v_def IN
    SELECT * FROM seller_level_definitions
    WHERE is_active = TRUE
    ORDER BY sort_order DESC
  LOOP
    -- Check if seller meets all requirements for this level
    IF v_stats.completed_orders >= v_def.min_orders
       AND v_stats.total_earnings >= v_def.min_earnings
       AND v_stats.average_rating >= v_def.min_rating
       AND v_stats.on_time_delivery_rate >= v_def.min_on_time_rate
       AND v_stats.response_rate >= v_def.min_response_rate
       AND v_stats.order_completion_rate >= v_def.min_completion_rate
       AND v_stats.days_since_joined >= v_def.min_days_active
       AND v_stats.repeat_buyer_rate >= v_def.min_repeat_buyer_rate
       AND NOT v_stats.has_active_warning
    THEN
      v_level := v_def.tier;
      EXIT; -- Found highest eligible level
    END IF;
  END LOOP;

  RETURN v_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update seller statistics after an order
CREATE OR REPLACE FUNCTION update_seller_stats_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_new_level seller_level_tier;
  v_old_level seller_level_tier;
BEGIN
  -- Get seller ID from the order
  v_seller_id := NEW.seller_id;

  -- Update statistics
  UPDATE seller_statistics SET
    total_orders = total_orders + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
    completed_orders = (
      SELECT COUNT(*) FROM service_orders
      WHERE seller_id = v_seller_id AND status = 'completed'
    ),
    cancelled_orders = (
      SELECT COUNT(*) FROM service_orders
      WHERE seller_id = v_seller_id AND status = 'cancelled'
    ),
    active_orders = (
      SELECT COUNT(*) FROM service_orders
      WHERE seller_id = v_seller_id AND status IN ('pending', 'in_progress')
    ),
    total_earnings = (
      SELECT COALESCE(SUM(total), 0) FROM service_orders
      WHERE seller_id = v_seller_id AND status = 'completed'
    ),
    last_order_date = NOW(),
    updated_at = NOW()
  WHERE user_id = v_seller_id;

  -- Check for level change
  SELECT current_level INTO v_old_level FROM seller_statistics WHERE user_id = v_seller_id;
  v_new_level := calculate_seller_level(v_seller_id);

  IF v_new_level != v_old_level THEN
    -- Update level
    UPDATE seller_statistics SET
      current_level = v_new_level,
      level_achieved_at = NOW()
    WHERE user_id = v_seller_id;

    -- Log level change
    INSERT INTO seller_level_history (user_id, previous_level, new_level, change_type, reason)
    VALUES (
      v_seller_id,
      v_old_level,
      v_new_level,
      CASE WHEN v_new_level > v_old_level THEN 'promotion' ELSE 'demotion' END,
      'Automatic evaluation after order completion'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award XP function
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
  v_streak_multiplier DECIMAL(3,2);
BEGIN
  -- Get streak multiplier
  SELECT streak_multiplier INTO v_streak_multiplier
  FROM seller_xp WHERE user_id = p_user_id;

  v_streak_multiplier := COALESCE(v_streak_multiplier, 1.0);

  -- Apply streak bonus
  p_amount := ROUND(p_amount * v_streak_multiplier);

  -- Insert XP transaction
  INSERT INTO xp_transactions (user_id, xp_amount, xp_type, description, related_entity_type, related_entity_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_entity_type, p_entity_id);

  -- Update total XP
  UPDATE seller_xp SET
    total_xp = total_xp + p_amount,
    xp_from_orders = xp_from_orders + CASE WHEN p_type = 'order' THEN p_amount ELSE 0 END,
    xp_from_reviews = xp_from_reviews + CASE WHEN p_type = 'review' THEN p_amount ELSE 0 END,
    xp_from_badges = xp_from_badges + CASE WHEN p_type = 'badge' THEN p_amount ELSE 0 END,
    xp_from_profile = xp_from_profile + CASE WHEN p_type = 'profile' THEN p_amount ELSE 0 END,
    xp_from_activity = xp_from_activity + CASE WHEN p_type = 'activity' THEN p_amount ELSE 0 END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING total_xp INTO v_new_total;

  -- Check for level up
  PERFORM check_xp_level_up(p_user_id);

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check XP level up
CREATE OR REPLACE FUNCTION check_xp_level_up(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_xp seller_xp%ROWTYPE;
  v_new_level INTEGER;
  v_required_xp INTEGER;
BEGIN
  SELECT * INTO v_xp FROM seller_xp WHERE user_id = p_user_id;

  IF NOT FOUND THEN RETURN; END IF;

  -- Calculate level from XP (exponential curve)
  -- Level 1: 100 XP, Level 2: 250 XP, Level 3: 500 XP, etc.
  v_new_level := 1;
  v_required_xp := 100;

  WHILE v_xp.total_xp >= v_required_xp LOOP
    v_new_level := v_new_level + 1;
    v_required_xp := ROUND(v_required_xp * 1.5);
  END LOOP;

  IF v_new_level != v_xp.current_level THEN
    UPDATE seller_xp SET
      current_level = v_new_level,
      xp_to_next_level = v_required_xp - total_xp
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award badge function
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id UUID,
  p_badge_code VARCHAR(50),
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_badge_id UUID;
  v_badge_xp INTEGER;
  v_awarded_id UUID;
BEGIN
  -- Get badge
  SELECT id, xp_reward INTO v_badge_id, v_badge_xp
  FROM badge_definitions
  WHERE code = p_badge_code AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Badge not found: %', p_badge_code;
  END IF;

  -- Check if already awarded
  IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
    RETURN NULL; -- Already has badge
  END IF;

  -- Award badge
  INSERT INTO user_badges (user_id, badge_id, awarded_reason)
  VALUES (p_user_id, v_badge_id, p_reason)
  RETURNING id INTO v_awarded_id;

  -- Award XP if badge has reward
  IF v_badge_xp > 0 THEN
    PERFORM award_xp(p_user_id, v_badge_xp, 'badge', 'Earned badge: ' || p_badge_code);
  END IF;

  RETURN v_awarded_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check achievements and award badges
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_stats seller_statistics%ROWTYPE;
  v_achievement RECORD;
BEGIN
  SELECT * INTO v_stats FROM seller_statistics WHERE user_id = p_user_id;

  IF NOT FOUND THEN RETURN; END IF;

  -- Check order milestones
  FOR v_achievement IN
    SELECT * FROM badge_definitions
    WHERE achievement_type = 'orders_completed' AND is_active = TRUE
  LOOP
    IF v_stats.completed_orders >= v_achievement.threshold THEN
      PERFORM award_badge(p_user_id, v_achievement.code, 'Completed ' || v_achievement.threshold || ' orders');
    END IF;
  END LOOP;

  -- Check revenue milestones
  FOR v_achievement IN
    SELECT * FROM badge_definitions
    WHERE achievement_type = 'revenue_earned' AND is_active = TRUE
  LOOP
    IF v_stats.total_earnings >= v_achievement.threshold THEN
      PERFORM award_badge(p_user_id, v_achievement.code, 'Earned $' || v_achievement.threshold);
    END IF;
  END LOOP;

  -- Check 5-star review milestones
  FOR v_achievement IN
    SELECT * FROM badge_definitions
    WHERE achievement_type = 'five_star_reviews' AND is_active = TRUE
  LOOP
    IF v_stats.five_star_reviews >= v_achievement.threshold THEN
      PERFORM award_badge(p_user_id, v_achievement.code, 'Received ' || v_achievement.threshold || ' five-star reviews');
    END IF;
  END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger on order completion (assuming service_orders table exists)
-- CREATE TRIGGER trg_update_seller_stats
-- AFTER INSERT OR UPDATE ON service_orders
-- FOR EACH ROW
-- WHEN (NEW.status = 'completed')
-- EXECUTE FUNCTION update_seller_stats_on_order();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE seller_level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_level_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_evaluation_logs ENABLE ROW LEVEL SECURITY;

-- Public read for level definitions
CREATE POLICY "Anyone can view level definitions"
  ON seller_level_definitions FOR SELECT USING (TRUE);

-- Public read for badge definitions
CREATE POLICY "Anyone can view badge definitions"
  ON badge_definitions FOR SELECT USING (TRUE);

-- Users can view their own stats
CREATE POLICY "Users can view own statistics"
  ON seller_statistics FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view seller stats (for profile display)
CREATE POLICY "Public can view seller statistics"
  ON seller_statistics FOR SELECT USING (TRUE);

-- Users can view their own level history
CREATE POLICY "Users can view own level history"
  ON seller_level_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view user badges
CREATE POLICY "Public can view user badges"
  ON user_badges FOR SELECT USING (TRUE);

-- Users can update their badge display preferences
CREATE POLICY "Users can update own badge display"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own XP
CREATE POLICY "Users can view own XP"
  ON seller_xp FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own XP transactions
CREATE POLICY "Users can view own XP transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON seller_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own evaluation logs
CREATE POLICY "Users can view own evaluation logs"
  ON level_evaluation_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default seller level definitions
INSERT INTO seller_level_definitions
  (tier, display_name, description, color, min_orders, min_earnings, min_rating, min_on_time_rate, min_response_rate, min_completion_rate, min_days_active, min_repeat_buyer_rate, commission_discount, featured_priority, max_active_gigs, can_offer_custom_quotes, can_use_promoted_gigs, support_priority, sort_order)
VALUES
  ('new_seller', 'New Seller', 'Just getting started on FreeFlow', '#6B7280', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, FALSE, FALSE, 'standard', 1),
  ('rising_talent', 'Rising Talent', 'Showing great promise with early success', '#10B981', 5, 100, 4.0, 80, 80, 80, 30, 0, 2, 2, 7, FALSE, FALSE, 'standard', 2),
  ('level_1', 'Level 1 Seller', 'Established seller with proven track record', '#3B82F6', 20, 500, 4.5, 85, 85, 90, 60, 10, 5, 3, 10, TRUE, FALSE, 'standard', 3),
  ('level_2', 'Level 2 Seller', 'Experienced professional with excellent metrics', '#8B5CF6', 50, 2000, 4.7, 90, 90, 95, 120, 20, 10, 4, 15, TRUE, TRUE, 'priority', 4),
  ('top_rated', 'Top Rated Seller', 'Elite seller with exceptional performance', '#F59E0B', 100, 10000, 4.8, 95, 95, 98, 180, 30, 15, 5, 20, TRUE, TRUE, 'priority', 5),
  ('pro', 'Pro Verified', 'Manually vetted professional expert', '#EF4444', 50, 5000, 4.9, 95, 95, 98, 90, 25, 20, 10, 30, TRUE, TRUE, 'vip', 6);

-- Insert default badge definitions
INSERT INTO badge_definitions
  (code, name, description, category, icon_name, color, achievement_type, threshold, xp_reward, sort_order)
VALUES
  -- Order milestones
  ('first_order', 'First Sale', 'Completed your first order', 'achievement', 'ShoppingBag', '#10B981', 'orders_completed', 1, 50, 1),
  ('orders_10', 'Getting Started', 'Completed 10 orders', 'achievement', 'Package', '#3B82F6', 'orders_completed', 10, 100, 2),
  ('orders_50', 'Busy Bee', 'Completed 50 orders', 'achievement', 'Zap', '#8B5CF6', 'orders_completed', 50, 250, 3),
  ('orders_100', 'Century Club', 'Completed 100 orders', 'achievement', 'Trophy', '#F59E0B', 'orders_completed', 100, 500, 4),
  ('orders_500', 'Order Master', 'Completed 500 orders', 'achievement', 'Crown', '#EF4444', 'orders_completed', 500, 1000, 5),

  -- Revenue milestones
  ('earned_1k', 'First Thousand', 'Earned $1,000', 'achievement', 'DollarSign', '#10B981', 'revenue_earned', 1000, 100, 10),
  ('earned_10k', 'Ten Grand', 'Earned $10,000', 'achievement', 'Banknote', '#3B82F6', 'revenue_earned', 10000, 300, 11),
  ('earned_50k', 'High Roller', 'Earned $50,000', 'achievement', 'Gem', '#8B5CF6', 'revenue_earned', 50000, 500, 12),
  ('earned_100k', 'Six Figure Seller', 'Earned $100,000', 'achievement', 'Star', '#F59E0B', 'revenue_earned', 100000, 1000, 13),

  -- Review milestones
  ('reviews_10', 'Well Reviewed', 'Received 10 five-star reviews', 'quality', 'Star', '#F59E0B', 'five_star_reviews', 10, 100, 20),
  ('reviews_50', 'Crowd Favorite', 'Received 50 five-star reviews', 'quality', 'Stars', '#F59E0B', 'five_star_reviews', 50, 250, 21),
  ('reviews_100', 'Superstar', 'Received 100 five-star reviews', 'quality', 'Sparkles', '#F59E0B', 'five_star_reviews', 100, 500, 22),

  -- Performance badges
  ('quick_responder', 'Quick Responder', 'Average response time under 1 hour', 'communication', 'MessageCircle', '#10B981', 'quick_response', 1, 150, 30),
  ('always_on_time', 'Always On Time', '100% on-time delivery for 30 days', 'speed', 'Clock', '#3B82F6', 'on_time_delivery', 30, 200, 31),
  ('perfect_month', 'Perfect Month', 'No cancellations and all 5-star reviews in a month', 'quality', 'Award', '#8B5CF6', 'perfect_month', 1, 300, 32),

  -- Repeat clients
  ('loyal_clients_5', 'Client Magnet', '5 clients ordered again', 'quality', 'Users', '#10B981', 'repeat_clients', 5, 150, 40),
  ('loyal_clients_20', 'Client Favorite', '20 clients ordered again', 'quality', 'Heart', '#EF4444', 'repeat_clients', 20, 300, 41),

  -- Verified badges
  ('identity_verified', 'Identity Verified', 'Identity has been verified', 'verified', 'ShieldCheck', '#10B981', 'identity_verified', 1, 100, 50),
  ('skill_certified', 'Skill Certified', 'Passed skill assessment test', 'verified', 'BadgeCheck', '#3B82F6', 'skill_certified', 1, 200, 51),
  ('portfolio_complete', 'Portfolio Pro', 'Complete portfolio with 10+ items', 'verified', 'Image', '#8B5CF6', 'portfolio_complete', 10, 50, 52),

  -- Special badges
  ('early_adopter', 'Early Adopter', 'Joined FreeFlow in its first year', 'special', 'Rocket', '#F59E0B', NULL, NULL, 100, 60),
  ('top_rated_2024', 'Top Rated 2024', 'Achieved Top Rated status in 2024', 'special', 'Medal', '#EF4444', NULL, NULL, 500, 61);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for public seller profiles
CREATE OR REPLACE VIEW public_seller_profiles AS
SELECT
  ss.user_id,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  ss.current_level,
  sld.display_name as level_name,
  sld.color as level_color,
  ss.average_rating,
  ss.total_reviews,
  ss.completed_orders,
  ss.on_time_delivery_rate,
  ss.response_time_hours,
  sx.total_xp,
  sx.current_level as xp_level,
  ss.days_since_joined
FROM seller_statistics ss
JOIN auth.users u ON u.id = ss.user_id
JOIN seller_level_definitions sld ON sld.tier = ss.current_level
LEFT JOIN seller_xp sx ON sx.user_id = ss.user_id;
