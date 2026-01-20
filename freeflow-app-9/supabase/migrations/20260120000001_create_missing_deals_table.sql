-- Create deals table to match use-deals.ts and link to clients
-- Fixes missing table error in Clients Dashboard

CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    deal_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    stage TEXT NOT NULL DEFAULT 'lead',
    probability INTEGER DEFAULT 0,
    expected_close_date TIMESTAMPTZ,
    actual_close_date TIMESTAMPTZ,
    source TEXT,
    priority TEXT DEFAULT 'medium',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);

-- RLS Policies
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deals"
    ON public.deals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals"
    ON public.deals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
    ON public.deals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
    ON public.deals FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
