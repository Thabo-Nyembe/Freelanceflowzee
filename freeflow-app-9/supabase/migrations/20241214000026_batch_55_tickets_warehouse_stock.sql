-- =============================================
-- BATCH 55: Tickets, Warehouse, Stock Tables
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. SUPPORT TICKETS TABLES
-- =============================================

-- Main tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) NOT NULL,
  subject VARCHAR(300) NOT NULL,
  description TEXT,
  customer_name VARCHAR(200),
  customer_email VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(30) DEFAULT 'open', -- open, in-progress, pending, resolved, closed
  category VARCHAR(100),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_name VARCHAR(200),
  sla_status VARCHAR(30) DEFAULT 'on_track', -- on_track, at_risk, breached, met
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  message_count INTEGER DEFAULT 0,
  attachment_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Ticket messages/comments
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(30) DEFAULT 'reply', -- reply, note, system
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  sender_name VARCHAR(200),
  sender_email VARCHAR(255),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. WAREHOUSE TABLES
-- =============================================

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warehouse_code VARCHAR(50) NOT NULL,
  warehouse_name VARCHAR(200) NOT NULL,
  warehouse_type VARCHAR(50) DEFAULT 'distribution', -- distribution, fulfillment, storage, cold-storage
  status VARCHAR(30) DEFAULT 'active', -- active, maintenance, inactive
  location VARCHAR(200),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(30),
  capacity_sqm DECIMAL(12, 2) DEFAULT 0, -- square meters
  utilization_percent DECIMAL(5, 2) DEFAULT 0,
  staff_count INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  zone_count INTEGER DEFAULT 0,
  manager_name VARCHAR(200),
  manager_email VARCHAR(255),
  phone VARCHAR(50),
  operating_hours VARCHAR(100),
  last_inspection_date DATE,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Warehouse zones
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_code VARCHAR(50) NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  zone_type VARCHAR(50) DEFAULT 'general', -- general, cold, hazmat, bulk, picking
  capacity_sqm DECIMAL(10, 2) DEFAULT 0,
  utilization_percent DECIMAL(5, 2) DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  temperature_min DECIMAL(5, 2),
  temperature_max DECIMAL(5, 2),
  humidity_max DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. STOCK MOVEMENT TABLES
-- =============================================

-- Stock movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movement_number VARCHAR(50) NOT NULL,
  movement_type VARCHAR(30) NOT NULL, -- inbound, outbound, transfer, adjustment
  product_name VARCHAR(300) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  total_value DECIMAL(14, 2) DEFAULT 0,
  from_location VARCHAR(200),
  to_location VARCHAR(200),
  from_warehouse_id UUID REFERENCES warehouses(id),
  to_warehouse_id UUID REFERENCES warehouses(id),
  reference_number VARCHAR(100),
  reference_type VARCHAR(50), -- PO, SO, TRF, ADJ
  status VARCHAR(30) DEFAULT 'pending', -- pending, in-transit, completed, cancelled
  operator_name VARCHAR(200),
  operator_id UUID REFERENCES auth.users(id),
  notes TEXT,
  batch_number VARCHAR(100),
  expiry_date DATE,
  metadata JSONB DEFAULT '{}',
  movement_date TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock levels (current inventory)
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES warehouse_zones(id) ON DELETE SET NULL,
  product_name VARCHAR(300) NOT NULL,
  sku VARCHAR(100),
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  unit_cost DECIMAL(12, 2) DEFAULT 0,
  total_value DECIMAL(14, 2) DEFAULT 0,
  last_movement_date TIMESTAMPTZ,
  last_count_date TIMESTAMPTZ,
  location_code VARCHAR(100),
  batch_number VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Indexes for warehouses
CREATE INDEX IF NOT EXISTS idx_warehouses_user ON warehouses(user_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(warehouse_type);
CREATE INDEX IF NOT EXISTS idx_warehouse_zones_warehouse ON warehouse_zones(warehouse_id);

-- Indexes for stock
CREATE INDEX IF NOT EXISTS idx_stock_movements_user ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_status ON stock_movements(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_sku ON stock_movements(sku);
CREATE INDEX IF NOT EXISTS idx_stock_levels_user ON stock_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_sku ON stock_levels(sku);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tickets" ON support_tickets FOR DELETE USING (auth.uid() = user_id);

-- Ticket messages policies
CREATE POLICY "Users can view own ticket messages" ON ticket_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ticket messages" ON ticket_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Warehouses policies
CREATE POLICY "Users can view own warehouses" ON warehouses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own warehouses" ON warehouses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own warehouses" ON warehouses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own warehouses" ON warehouses FOR DELETE USING (auth.uid() = user_id);

-- Warehouse zones policies
CREATE POLICY "Users can view own zones" ON warehouse_zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own zones" ON warehouse_zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own zones" ON warehouse_zones FOR UPDATE USING (auth.uid() = user_id);

-- Stock movements policies
CREATE POLICY "Users can view own stock movements" ON stock_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stock movements" ON stock_movements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock movements" ON stock_movements FOR UPDATE USING (auth.uid() = user_id);

-- Stock levels policies
CREATE POLICY "Users can view own stock levels" ON stock_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stock levels" ON stock_levels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock levels" ON stock_levels FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_zones_updated_at BEFORE UPDATE ON warehouse_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_movements_updated_at BEFORE UPDATE ON stock_movements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ENABLE REAL-TIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE warehouses;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_levels;
