-- Batch 68: Security Audit, Vulnerability Scan, and Logistics tables
-- Created: 2024-12-14

-- ============================================
-- SECURITY AUDITS
-- ============================================

-- Security audits table
CREATE TABLE IF NOT EXISTS security_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  audit_code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  audit_type TEXT DEFAULT 'compliance' CHECK (audit_type IN ('access-control', 'data-encryption', 'compliance', 'penetration-test', 'code-review', 'infrastructure')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'passed', 'failed', 'warning', 'cancelled')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  compliance_standards TEXT[] DEFAULT '{}',
  audited_by TEXT,
  auditor_email TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  findings_critical INTEGER DEFAULT 0,
  findings_high INTEGER DEFAULT 0,
  findings_medium INTEGER DEFAULT 0,
  findings_low INTEGER DEFAULT 0,
  total_recommendations INTEGER DEFAULT 0,
  remediated_count INTEGER DEFAULT 0,
  security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
  report_url TEXT,
  schedule_cron TEXT,
  next_scheduled_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Audit findings table
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES security_audits(id) ON DELETE CASCADE NOT NULL,
  finding_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  category TEXT,
  affected_resource TEXT,
  evidence TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'remediated', 'accepted', 'false-positive')),
  remediated_at TIMESTAMPTZ,
  remediated_by UUID REFERENCES auth.users(id),
  cve_id TEXT,
  cvss_score DECIMAL(3,1),
  compliance_impact TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence for audit codes
CREATE SEQUENCE IF NOT EXISTS audit_code_seq START 1000;

-- Function to generate audit code
CREATE OR REPLACE FUNCTION generate_audit_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.audit_code IS NULL THEN
    NEW.audit_code := 'AUD-' || LPAD(nextval('audit_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for audit code
DROP TRIGGER IF EXISTS set_audit_code ON security_audits;
CREATE TRIGGER set_audit_code
  BEFORE INSERT ON security_audits
  FOR EACH ROW
  EXECUTE FUNCTION generate_audit_code();

-- RLS policies for security_audits
ALTER TABLE security_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits"
  ON security_audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audits"
  ON security_audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits"
  ON security_audits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audits"
  ON security_audits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for audit_findings
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view findings of own audits"
  ON audit_findings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM security_audits WHERE id = audit_findings.audit_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create findings for own audits"
  ON audit_findings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM security_audits WHERE id = audit_findings.audit_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update findings of own audits"
  ON audit_findings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM security_audits WHERE id = audit_findings.audit_id AND user_id = auth.uid()
  ));

-- ============================================
-- VULNERABILITY SCANS
-- ============================================

-- Vulnerability scans table
CREATE TABLE IF NOT EXISTS vulnerability_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  scan_type TEXT DEFAULT 'dependency' CHECK (scan_type IN ('dependency', 'code', 'container', 'infrastructure', 'web-application', 'network', 'api')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'failed', 'cancelled')),
  scanner TEXT,
  scanner_version TEXT,
  target TEXT,
  target_type TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  scanned_items INTEGER DEFAULT 0,
  vuln_critical INTEGER DEFAULT 0,
  vuln_high INTEGER DEFAULT 0,
  vuln_medium INTEGER DEFAULT 0,
  vuln_low INTEGER DEFAULT 0,
  vuln_info INTEGER DEFAULT 0,
  fixed_count INTEGER DEFAULT 0,
  ignored_count INTEGER DEFAULT 0,
  false_positive_count INTEGER DEFAULT 0,
  report_url TEXT,
  schedule_cron TEXT,
  next_scheduled_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES vulnerability_scans(id) ON DELETE CASCADE NOT NULL,
  vuln_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  category TEXT,
  package_name TEXT,
  package_version TEXT,
  fixed_version TEXT,
  file_path TEXT,
  line_number INTEGER,
  cve_id TEXT,
  cwe_id TEXT,
  cvss_score DECIMAL(3,1),
  cvss_vector TEXT,
  exploit_available BOOLEAN DEFAULT FALSE,
  patch_available BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'fixed', 'ignored', 'false-positive', 'accepted')),
  fixed_at TIMESTAMPTZ,
  fixed_by UUID REFERENCES auth.users(id),
  remediation_notes TEXT,
  reference_urls TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence for scan codes
CREATE SEQUENCE IF NOT EXISTS scan_code_seq START 1000;

-- Function to generate scan code
CREATE OR REPLACE FUNCTION generate_scan_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scan_code IS NULL THEN
    NEW.scan_code := 'SCAN-' || LPAD(nextval('scan_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for scan code
DROP TRIGGER IF EXISTS set_scan_code ON vulnerability_scans;
CREATE TRIGGER set_scan_code
  BEFORE INSERT ON vulnerability_scans
  FOR EACH ROW
  EXECUTE FUNCTION generate_scan_code();

-- RLS policies for vulnerability_scans
ALTER TABLE vulnerability_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON vulnerability_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scans"
  ON vulnerability_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON vulnerability_scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON vulnerability_scans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for vulnerabilities
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vulns of own scans"
  ON vulnerabilities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM vulnerability_scans WHERE id = vulnerabilities.scan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create vulns for own scans"
  ON vulnerabilities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM vulnerability_scans WHERE id = vulnerabilities.scan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update vulns of own scans"
  ON vulnerabilities FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM vulnerability_scans WHERE id = vulnerabilities.scan_id AND user_id = auth.uid()
  ));

-- ============================================
-- LOGISTICS ROUTES
-- ============================================

-- Logistics routes table
CREATE TABLE IF NOT EXISTS logistics_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_code TEXT UNIQUE,
  route_name TEXT NOT NULL,
  description TEXT,
  route_type TEXT DEFAULT 'local' CHECK (route_type IN ('local', 'regional', 'national', 'international', 'express')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'delayed', 'cancelled')),
  driver_id TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('van', 'truck', 'semi-truck', 'cargo-plane', 'container-ship', 'motorcycle', 'drone')),
  vehicle_plate TEXT,
  vehicle_id TEXT,
  origin_address JSONB DEFAULT '{}',
  origin_city TEXT,
  origin_country TEXT,
  destination_address JSONB DEFAULT '{}',
  destination_city TEXT,
  destination_country TEXT,
  waypoints JSONB DEFAULT '[]',
  total_stops INTEGER DEFAULT 0,
  completed_stops INTEGER DEFAULT 0,
  total_distance_miles DECIMAL(10,2) DEFAULT 0,
  completed_distance_miles DECIMAL(10,2) DEFAULT 0,
  total_packages INTEGER DEFAULT 0,
  delivered_packages INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER DEFAULT 0,
  actual_duration_minutes INTEGER,
  departure_time TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  fuel_cost DECIMAL(10,2) DEFAULT 0,
  toll_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  delay_reason TEXT,
  special_instructions TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Route stops table
CREATE TABLE IF NOT EXISTS route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES logistics_routes(id) ON DELETE CASCADE NOT NULL,
  stop_number INTEGER NOT NULL,
  stop_type TEXT DEFAULT 'delivery' CHECK (stop_type IN ('pickup', 'delivery', 'transfer', 'checkpoint', 'fuel', 'rest')),
  address JSONB DEFAULT '{}',
  city TEXT,
  postal_code TEXT,
  country TEXT,
  recipient_name TEXT,
  recipient_phone TEXT,
  packages_count INTEGER DEFAULT 0,
  packages_delivered INTEGER DEFAULT 0,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'completed', 'skipped', 'failed')),
  signature_collected BOOLEAN DEFAULT FALSE,
  signature_url TEXT,
  photo_proof_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet vehicles table
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_code TEXT UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('van', 'truck', 'semi-truck', 'cargo-plane', 'container-ship', 'motorcycle', 'drone')),
  make TEXT,
  model TEXT,
  year INTEGER,
  license_plate TEXT,
  vin TEXT,
  capacity_weight DECIMAL(10,2),
  capacity_volume DECIMAL(10,2),
  fuel_type TEXT DEFAULT 'diesel' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'jet-fuel', 'lng')),
  fuel_efficiency DECIMAL(5,2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'retired')),
  current_driver_id TEXT,
  current_location JSONB DEFAULT '{}',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  total_miles DECIMAL(12,2) DEFAULT 0,
  insurance_expiry DATE,
  registration_expiry DATE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for route codes
CREATE SEQUENCE IF NOT EXISTS route_code_seq START 1000;

-- Sequence for vehicle codes
CREATE SEQUENCE IF NOT EXISTS vehicle_code_seq START 1000;

-- Function to generate route code
CREATE OR REPLACE FUNCTION generate_route_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.route_code IS NULL THEN
    NEW.route_code := 'LOG-' || LPAD(nextval('route_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate vehicle code
CREATE OR REPLACE FUNCTION generate_vehicle_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vehicle_code IS NULL THEN
    NEW.vehicle_code := 'VEH-' || LPAD(nextval('vehicle_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS set_route_code ON logistics_routes;
CREATE TRIGGER set_route_code
  BEFORE INSERT ON logistics_routes
  FOR EACH ROW
  EXECUTE FUNCTION generate_route_code();

DROP TRIGGER IF EXISTS set_vehicle_code ON fleet_vehicles;
CREATE TRIGGER set_vehicle_code
  BEFORE INSERT ON fleet_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION generate_vehicle_code();

-- RLS policies for logistics_routes
ALTER TABLE logistics_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routes"
  ON logistics_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own routes"
  ON logistics_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes"
  ON logistics_routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes"
  ON logistics_routes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for route_stops
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stops of own routes"
  ON route_stops FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM logistics_routes WHERE id = route_stops.route_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create stops for own routes"
  ON route_stops FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM logistics_routes WHERE id = route_stops.route_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update stops of own routes"
  ON route_stops FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM logistics_routes WHERE id = route_stops.route_id AND user_id = auth.uid()
  ));

-- RLS policies for fleet_vehicles
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON fleet_vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vehicles"
  ON fleet_vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON fleet_vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON fleet_vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audits_user_id ON security_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audits_status ON security_audits(status);
CREATE INDEX IF NOT EXISTS idx_security_audits_type ON security_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON audit_findings(severity);

CREATE INDEX IF NOT EXISTS idx_vulnerability_scans_user_id ON vulnerability_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_scans_status ON vulnerability_scans(status);
CREATE INDEX IF NOT EXISTS idx_vulnerability_scans_type ON vulnerability_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);

CREATE INDEX IF NOT EXISTS idx_logistics_routes_user_id ON logistics_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_routes_status ON logistics_routes(status);
CREATE INDEX IF NOT EXISTS idx_logistics_routes_type ON logistics_routes(route_type);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_user_id ON fleet_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_status ON fleet_vehicles(status);

-- Update triggers
CREATE TRIGGER update_security_audits_updated_at
  BEFORE UPDATE ON security_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_findings_updated_at
  BEFORE UPDATE ON audit_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vulnerability_scans_updated_at
  BEFORE UPDATE ON vulnerability_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vulnerabilities_updated_at
  BEFORE UPDATE ON vulnerabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_routes_updated_at
  BEFORE UPDATE ON logistics_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at
  BEFORE UPDATE ON route_stops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_vehicles_updated_at
  BEFORE UPDATE ON fleet_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
