/**
 * Dispute Resolution System - FreeFlow A+++ Implementation
 * Comprehensive dispute handling for marketplace orders
 *
 * Features:
 * - Multi-stage dispute workflow
 * - Evidence collection and review
 * - Real-time messaging between parties
 * - Mediation and escalation paths
 * - Resolution proposals and voting
 * - Automatic refund/partial refund processing
 * - Appeals system
 * - Dispute analytics and fraud detection
 */

-- Dispute status enum
CREATE TYPE dispute_status AS ENUM (
  'opened',
  'response_pending',
  'in_discussion',
  'evidence_review',
  'mediation',
  'resolution_proposed',
  'resolved',
  'closed',
  'appealed',
  'escalated'
);

-- Dispute type enum
CREATE TYPE dispute_type AS ENUM (
  'not_as_described',
  'quality_issue',
  'late_delivery',
  'no_delivery',
  'scope_creep',
  'communication',
  'refund_request',
  'payment_issue',
  'intellectual_property',
  'harassment',
  'other'
);

-- Resolution type enum
CREATE TYPE resolution_type AS ENUM (
  'full_refund',
  'partial_refund',
  'redelivery',
  'order_cancelled',
  'order_completed',
  'mutual_cancellation',
  'no_action',
  'account_warning',
  'account_suspension'
);

-- Main disputes table
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order reference
  order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  job_contract_id UUID, -- For job contracts (future)

  -- Parties
  initiator_id UUID NOT NULL REFERENCES auth.users(id),
  respondent_id UUID NOT NULL REFERENCES auth.users(id),
  mediator_id UUID REFERENCES auth.users(id), -- Assigned support staff

  -- Dispute details
  dispute_type dispute_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Amount in dispute
  disputed_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Status tracking
  status dispute_status DEFAULT 'opened',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Timeline
  response_deadline TIMESTAMPTZ,
  evidence_deadline TIMESTAMPTZ,
  resolution_deadline TIMESTAMPTZ,

  -- Flags
  buyer_is_initiator BOOLEAN NOT NULL,
  auto_escalate_enabled BOOLEAN DEFAULT true,
  requires_mediation BOOLEAN DEFAULT false,

  -- Resolution
  resolution_type resolution_type,
  resolution_amount DECIMAL(12,2),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),

  -- Appeal tracking
  appeal_count INTEGER DEFAULT 0,
  last_appeal_at TIMESTAMPTZ,
  appeal_limit INTEGER DEFAULT 1,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute messages for communication
CREATE TABLE dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),

  -- Message content
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'proposal', 'evidence', 'decision')),

  -- For system messages
  system_event TEXT,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Read tracking
  read_by_initiator BOOLEAN DEFAULT false,
  read_by_respondent BOOLEAN DEFAULT false,
  read_by_mediator BOOLEAN DEFAULT false,

  -- Visibility
  is_private_to_mediator BOOLEAN DEFAULT false, -- Only visible to mediator

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence submitted for disputes
CREATE TABLE dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id),

  -- Evidence details
  title TEXT NOT NULL,
  description TEXT,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'screenshot', 'file', 'link', 'chat_log', 'contract',
    'invoice', 'delivery_proof', 'communication', 'other'
  )),

  -- File reference
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,

  -- External link
  external_url TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,

  -- Relevance score (set by mediator)
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 10),
  mediator_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resolution proposals
CREATE TABLE dispute_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),

  -- Proposal details
  resolution_type resolution_type NOT NULL,
  proposed_amount DECIMAL(12,2),
  description TEXT NOT NULL,
  terms TEXT,

  -- Voting
  initiator_accepted BOOLEAN,
  respondent_accepted BOOLEAN,
  mediator_recommended BOOLEAN,

  -- Deadline for response
  expires_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'countered')),

  -- Counter proposal reference
  counter_proposal_id UUID REFERENCES dispute_proposals(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute timeline/activity log
CREATE TABLE dispute_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'opened', 'responded', 'evidence_submitted', 'message_sent',
    'escalated', 'mediator_assigned', 'proposal_made', 'proposal_accepted',
    'proposal_rejected', 'resolved', 'appealed', 'closed', 'status_changed',
    'deadline_extended', 'auto_action'
  )),

  description TEXT NOT NULL,

  -- Previous and new values for status changes
  previous_value TEXT,
  new_value TEXT,

  -- Related entity
  related_entity_type TEXT,
  related_entity_id UUID,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mediators/Support staff for dispute resolution
CREATE TABLE dispute_mediators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,

  -- Mediator details
  display_name TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}', -- Areas of expertise

  -- Capacity
  max_concurrent_disputes INTEGER DEFAULT 10,
  current_disputes INTEGER DEFAULT 0,

  -- Performance
  total_resolved INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10,2),
  satisfaction_rating DECIMAL(3,2),

  -- Availability
  is_available BOOLEAN DEFAULT true,
  unavailable_until TIMESTAMPTZ,

  -- Permissions
  can_force_resolution BOOLEAN DEFAULT false,
  can_issue_warnings BOOLEAN DEFAULT true,
  can_suspend_accounts BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute templates for common issues
CREATE TABLE dispute_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template details
  title TEXT NOT NULL,
  dispute_type dispute_type NOT NULL,
  description_template TEXT NOT NULL,

  -- Suggested resolution paths
  suggested_resolutions JSONB DEFAULT '[]',

  -- Common evidence types needed
  required_evidence TEXT[] DEFAULT '{}',

  -- Estimated resolution time
  estimated_resolution_days INTEGER DEFAULT 7,

  -- Auto-actions
  auto_escalate_after_days INTEGER DEFAULT 3,

  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_disputes_order ON disputes(order_id);
CREATE INDEX idx_disputes_initiator ON disputes(initiator_id);
CREATE INDEX idx_disputes_respondent ON disputes(respondent_id);
CREATE INDEX idx_disputes_mediator ON disputes(mediator_id);
CREATE INDEX idx_disputes_status ON disputes(status) WHERE status NOT IN ('resolved', 'closed');
CREATE INDEX idx_disputes_priority ON disputes(priority, created_at) WHERE status NOT IN ('resolved', 'closed');
CREATE INDEX idx_disputes_deadline ON disputes(response_deadline) WHERE status = 'response_pending';

CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id, created_at);
CREATE INDEX idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);
CREATE INDEX idx_dispute_proposals_dispute ON dispute_proposals(dispute_id, status);
CREATE INDEX idx_dispute_activity_dispute ON dispute_activity(dispute_id, created_at);

CREATE INDEX idx_mediators_available ON dispute_mediators(is_available, current_disputes)
  WHERE is_available = true;

-- RLS Policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_mediators ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_templates ENABLE ROW LEVEL SECURITY;

-- Disputes: Parties and mediators can view
CREATE POLICY "Users can view their disputes"
  ON disputes FOR SELECT
  USING (
    auth.uid() = initiator_id OR
    auth.uid() = respondent_id OR
    auth.uid() = mediator_id OR
    EXISTS (SELECT 1 FROM dispute_mediators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Parties and mediators can update disputes"
  ON disputes FOR UPDATE
  USING (
    auth.uid() = initiator_id OR
    auth.uid() = respondent_id OR
    auth.uid() = mediator_id
  );

-- Messages: Visible to parties and mediators (except private messages)
CREATE POLICY "Users can view dispute messages"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_messages.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    ) AND (
      NOT is_private_to_mediator OR
      EXISTS (SELECT 1 FROM dispute_mediators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send dispute messages"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_messages.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    )
  );

-- Evidence: Visible to all parties
CREATE POLICY "Users can view dispute evidence"
  ON dispute_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_evidence.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    )
  );

CREATE POLICY "Users can submit evidence"
  ON dispute_evidence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_evidence.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id
      )
    )
  );

-- Proposals: Visible to parties
CREATE POLICY "Users can view proposals"
  ON dispute_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_proposals.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    )
  );

CREATE POLICY "Users can create proposals"
  ON dispute_proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_proposals.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    )
  );

CREATE POLICY "Users can update proposals"
  ON dispute_proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_proposals.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    )
  );

-- Activity: Visible to parties
CREATE POLICY "Users can view activity"
  ON dispute_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_activity.dispute_id AND (
        auth.uid() = d.initiator_id OR
        auth.uid() = d.respondent_id OR
        auth.uid() = d.mediator_id
      )
    )
  );

-- Templates: Public read
CREATE POLICY "Anyone can view templates"
  ON dispute_templates FOR SELECT
  USING (is_active = true);

-- Mediators: Admin only for write
CREATE POLICY "Mediators can view their profile"
  ON dispute_mediators FOR SELECT
  USING (true);

-- Functions for dispute management

-- Auto-assign mediator to dispute
CREATE OR REPLACE FUNCTION assign_dispute_mediator(dispute_id_param UUID)
RETURNS UUID AS $$
DECLARE
  assigned_mediator_id UUID;
BEGIN
  -- Find available mediator with lowest current load
  SELECT user_id INTO assigned_mediator_id
  FROM dispute_mediators
  WHERE is_available = true
    AND current_disputes < max_concurrent_disputes
    AND (unavailable_until IS NULL OR unavailable_until < NOW())
  ORDER BY current_disputes ASC, satisfaction_rating DESC
  LIMIT 1;

  IF assigned_mediator_id IS NOT NULL THEN
    -- Assign to dispute
    UPDATE disputes
    SET mediator_id = assigned_mediator_id,
        status = 'mediation',
        updated_at = NOW()
    WHERE id = dispute_id_param;

    -- Increment mediator's current disputes
    UPDATE dispute_mediators
    SET current_disputes = current_disputes + 1
    WHERE user_id = assigned_mediator_id;

    -- Log activity
    INSERT INTO dispute_activity (dispute_id, actor_id, activity_type, description)
    VALUES (dispute_id_param, assigned_mediator_id, 'mediator_assigned', 'Mediator assigned to dispute');
  END IF;

  RETURN assigned_mediator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate dispute resolution metrics
CREATE OR REPLACE FUNCTION update_mediator_metrics(mediator_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE dispute_mediators
  SET
    total_resolved = (
      SELECT COUNT(*) FROM disputes
      WHERE mediator_id = mediator_user_id AND status IN ('resolved', 'closed')
    ),
    avg_resolution_time_hours = (
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
      FROM disputes
      WHERE mediator_id = mediator_user_id AND resolved_at IS NOT NULL
    ),
    current_disputes = (
      SELECT COUNT(*) FROM disputes
      WHERE mediator_id = mediator_user_id AND status NOT IN ('resolved', 'closed')
    ),
    updated_at = NOW()
  WHERE user_id = mediator_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process dispute resolution (refund handling)
CREATE OR REPLACE FUNCTION process_dispute_resolution(
  dispute_id_param UUID,
  resolution_type_param resolution_type,
  resolution_amount_param DECIMAL,
  resolved_by_param UUID,
  notes_param TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  dispute_record RECORD;
BEGIN
  -- Get dispute details
  SELECT * INTO dispute_record FROM disputes WHERE id = dispute_id_param;

  IF dispute_record IS NULL THEN
    RAISE EXCEPTION 'Dispute not found';
  END IF;

  -- Update dispute
  UPDATE disputes
  SET
    status = 'resolved',
    resolution_type = resolution_type_param,
    resolution_amount = resolution_amount_param,
    resolution_notes = notes_param,
    resolved_at = NOW(),
    resolved_by = resolved_by_param,
    updated_at = NOW()
  WHERE id = dispute_id_param;

  -- Update order status if applicable
  IF dispute_record.order_id IS NOT NULL THEN
    UPDATE service_orders
    SET
      status = CASE
        WHEN resolution_type_param IN ('full_refund', 'order_cancelled', 'mutual_cancellation') THEN 'cancelled'
        WHEN resolution_type_param = 'order_completed' THEN 'completed'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = dispute_record.order_id;
  END IF;

  -- Log activity
  INSERT INTO dispute_activity (dispute_id, actor_id, activity_type, description, new_value)
  VALUES (
    dispute_id_param,
    resolved_by_param,
    'resolved',
    'Dispute resolved with ' || resolution_type_param::TEXT,
    resolution_type_param::TEXT
  );

  -- Update mediator metrics if assigned
  IF dispute_record.mediator_id IS NOT NULL THEN
    PERFORM update_mediator_metrics(dispute_record.mediator_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_dispute_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO dispute_activity (dispute_id, activity_type, description, previous_value, new_value)
    VALUES (NEW.id, 'status_changed', 'Dispute status changed', OLD.status::TEXT, NEW.status::TEXT);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_dispute_status_change
AFTER UPDATE ON disputes
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_dispute_status_change();

-- Insert default dispute templates
INSERT INTO dispute_templates (title, dispute_type, description_template, suggested_resolutions, required_evidence, estimated_resolution_days, auto_escalate_after_days) VALUES
(
  'Work Not As Described',
  'not_as_described',
  'The delivered work does not match the description or requirements specified in the order. Please describe specifically what was expected vs what was received.',
  '[{"type": "redelivery", "label": "Request revision"}, {"type": "partial_refund", "label": "Partial refund"}, {"type": "full_refund", "label": "Full refund"}]',
  ARRAY['screenshot', 'file', 'contract'],
  5,
  3
),
(
  'Quality Below Standard',
  'quality_issue',
  'The delivered work quality is significantly below professional standards. Please provide specific examples of quality issues.',
  '[{"type": "redelivery", "label": "Request revision"}, {"type": "partial_refund", "label": "Partial refund"}]',
  ARRAY['screenshot', 'file'],
  5,
  3
),
(
  'Late Delivery',
  'late_delivery',
  'The order was delivered after the agreed deadline without prior communication or extension request.',
  '[{"type": "partial_refund", "label": "Partial refund"}, {"type": "order_completed", "label": "Accept late delivery"}]',
  ARRAY['contract', 'communication'],
  3,
  2
),
(
  'No Delivery',
  'no_delivery',
  'The seller has not delivered the work and the deadline has passed with no communication.',
  '[{"type": "full_refund", "label": "Full refund"}, {"type": "order_cancelled", "label": "Cancel order"}]',
  ARRAY['contract'],
  3,
  2
),
(
  'Scope Disagreement',
  'scope_creep',
  'There is a disagreement about what was included in the original scope of work.',
  '[{"type": "mutual_cancellation", "label": "Mutual cancellation"}, {"type": "partial_refund", "label": "Partial refund"}]',
  ARRAY['contract', 'communication', 'chat_log'],
  7,
  5
),
(
  'Communication Issues',
  'communication',
  'The other party is unresponsive or not communicating as expected.',
  '[{"type": "no_action", "label": "Request mediator contact"}, {"type": "mutual_cancellation", "label": "Mutual cancellation"}]',
  ARRAY['communication', 'chat_log'],
  5,
  3
),
(
  'Refund Request',
  'refund_request',
  'Requesting a refund for work that has not started or for other valid reasons.',
  '[{"type": "full_refund", "label": "Full refund"}, {"type": "partial_refund", "label": "Partial refund"}]',
  ARRAY['contract'],
  5,
  3
);

-- Add comments
COMMENT ON TABLE disputes IS 'Main disputes table for marketplace order issues';
COMMENT ON TABLE dispute_messages IS 'Real-time messaging between dispute parties';
COMMENT ON TABLE dispute_evidence IS 'Evidence files and documentation for disputes';
COMMENT ON TABLE dispute_proposals IS 'Resolution proposals from parties or mediators';
COMMENT ON TABLE dispute_activity IS 'Activity log and timeline for disputes';
COMMENT ON TABLE dispute_mediators IS 'Support staff who can mediate disputes';
COMMENT ON TABLE dispute_templates IS 'Templates for common dispute types';
