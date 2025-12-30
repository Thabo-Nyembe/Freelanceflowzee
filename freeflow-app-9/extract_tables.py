#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

MIGRATIONS_DIR = "/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations"
OUTPUT_FILE = "/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations/20241216000010_all_missing_tables.sql"

# List of all missing tables
TABLES = [
    "access_logs", "activity_logs", "add_ons", "admin_settings", "advisory_analytics",
    "advisory_sessions", "ai_brand_assets", "ai_brand_guidelines", "ai_brand_voices",
    "ai_collection_images", "ai_color_palettes", "ai_content_templates", "ai_content_variations",
    "ai_create_api_keys", "ai_create_collaboration_sessions", "ai_create_cost_tracking",
    "ai_create_file_uploads", "ai_create_generation_history", "ai_create_model_usage",
    "ai_create_templates", "ai_design_concepts", "ai_designs", "ai_email_sequences",
    "ai_enhanced_tools", "ai_generated_content", "ai_generated_copy", "ai_generated_images",
    "ai_image_collections", "ai_image_presets", "ai_model_configs", "ai_swipe_file",
    "ai_usage_daily", "alerts", "allocations", "analytics", "analytics_alerts", "animations",
    "announcements", "api_endpoints", "api_request_logs", "app_reviews", "asset_collections",
    "attribution_touchpoints", "audience_analytics", "audit_alert_rules", "audit_events",
    "audit_findings", "automation", "automations", "backup_logs", "backups", "billing",
    "broadcasts", "budgets", "bug_comments", "bugs", "build_artifacts", "build_pipelines",
    "builds", "bulk_operations", "business_reports", "campaigns", "canvas", "capacity",
    "certifications", "changelog", "chat", "churn_analytics", "ci_cd", "client_contacts",
    "client_reviews", "client_satisfaction_metrics", "client_shares", "cloud_storage",
    "collab_document_comments", "collaboration", "collaboration_events", "collaboration_invites",
    "community", "community_analytics", "community_likes", "community_shares", "compliance",
    "compliance_checks", "compliance_findings", "compliance_reports", "connectors", "content",
    "content_analytics", "content_studio", "contracts", "cost_tracking", "courses",
    "creator_profiles", "creator_reviews", "crm_activities", "crm_contacts", "crm_deal_products",
    "crm_deals", "crm_leads", "crm_notes", "customer_ltv", "customer_success", "customers",
    "daily_analytics", "data_exports", "dependencies", "deployments", "desktop_apps",
    "digital_assets", "direct_messages", "docs", "documentation", "email_agent_approvals",
    "email_agent_config", "email_agent_messages", "email_agent_responses", "employee_payroll",
    "employees", "engagement_metrics", "event_registrations", "events", "export_presets",
    "extensions", "faqs", "features", "feedback", "file_activity", "file_cache", "file_metadata",
    "financial", "fleet_vehicles", "focus_sessions", "forms", "gallery_items", "growth_forecasts",
    "guest_upload_analytics", "guest_upload_payments", "health_scores", "help_article_feedback",
    "help_articles", "help_categories", "help_docs", "integration_preferences", "inventory",
    "invoice_analytics_daily", "invoice_clients", "invoice_events", "invoice_payment_links",
    "job_applications", "job_postings", "kb_article_feedback", "kb_article_versions",
    "kb_article_views", "kb_articles", "kb_bookmarks", "kb_categories", "kb_faqs",
    "kb_search_queries", "kb_suggested_topics", "kb_video_feedback", "kb_video_tutorials",
    "kb_video_views", "knowledge_articles", "knowledge_base", "lead_activities", "leads",
    "logistics_routes", "maintenance_tasks", "maintenance_windows", "marketing_channels",
    "marketplace_apps", "marketplace_integrations", "marketplace_reviews", "media_files",
    "media_folders", "milestone_deliverables", "mobile_app_features", "mobile_app_versions",
    "my_day_tasks", "newsletter_subscriptions", "onboarding_programs", "onboarding_tasks",
    "order_items", "orders", "organizations", "payroll_runs", "performance_alerts",
    "performance_analytics", "performance_benchmarks", "performance_goals", "performance_snapshots",
    "permissions", "polls", "portfolio_video_analytics", "portfolio_videos", "pricing_plans",
    "pricing_recommendations", "product_variants", "products", "project_activity",
    "project_analyses", "project_files", "project_tasks", "public", "qa_test_cases",
    "qa_test_executions", "rate_limit_tiers", "recommendation_feedback", "recommendation_history",
    "recommendation_preferences", "release_notes", "releases", "renewals", "report_filters",
    "report_shares", "report_widgets", "resource_skills", "resource_usage_logs", "revenue_analytics",
    "revenue_entries", "review_approvals", "review_collaborators", "review_notifications",
    "review_sessions", "review_stages", "review_templates", "roadmap_initiatives",
    "roadmap_milestones", "role_assignments", "roles", "route_stops", "sales_activities",
    "sales_deals", "sales_pipeline_stages", "security_audits", "seo_backlinks", "seo_keywords",
    "seo_pages", "server_metrics", "servers", "session_messages", "share_access_logs",
    "share_analytics", "share_links", "shipment_tracking", "shipments", "shipping_carriers",
    "skills_performance", "social_accounts", "social_analytics", "social_posts", "sprint_tasks",
    "sprints", "stock_levels", "stock_movements", "storage_analytics", "storage_optimization_jobs",
    "storage_tiers", "store_apps", "support_agents", "support_channels", "support_conversations",
    "support_ticket_replies", "support_tickets", "survey_questions", "survey_responses",
    "surveys", "system_insights", "system_logs", "team_management", "team_performance",
    "team_shares", "templates", "test_run_results", "themes", "third_party_integrations",
    "three_d_models", "ticket_messages", "time_tracking", "training_enrollments", "training_programs",
    "trash", "tutorials", "ui_components", "upf_analytics", "upf_attachments", "upf_reactions",
    "upf_voice_notes", "user_activity_logs", "user_cohorts", "user_management", "user_metrics",
    "user_settings", "video_daily_analytics", "video_encoding_jobs", "video_engagement_events",
    "video_events", "video_folders", "video_usage_logs", "video_views", "video_watch_time",
    "voice_clones", "voice_projects", "voice_scripts", "voice_syntheses", "voices",
    "vulnerabilities", "vulnerability_scans", "warehouse_zones", "warehouses",
    "webhook_event_types", "webinars", "workflow_steps"
]

def extract_create_table(file_path, table_name):
    """Extract CREATE TABLE statement for a specific table from a file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match CREATE TABLE statement
    # We need to match from CREATE TABLE to the closing semicolon
    # This handles multi-line statements with nested parentheses

    # Find the start of the CREATE TABLE statement
    pattern = rf'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?{re.escape(table_name)}\s*\('
    match = re.search(pattern, content, re.IGNORECASE | re.MULTILINE)

    if not match:
        return None

    # Find the matching closing parenthesis and semicolon
    start_pos = match.start()
    paren_count = 0
    in_string = False
    string_char = None
    i = match.end() - 1  # Start from the opening parenthesis

    while i < len(content):
        char = content[i]

        # Handle string literals
        if char in ('"', "'") and (i == 0 or content[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None

        # Count parentheses only outside of strings
        if not in_string:
            if char == '(':
                paren_count += 1
            elif char == ')':
                paren_count -= 1

                # Found the closing parenthesis
                if paren_count == 0:
                    # Now find the semicolon
                    j = i + 1
                    while j < len(content):
                        if content[j] == ';':
                            # Extract the complete statement
                            statement = content[start_pos:j+1]
                            return statement.strip()
                        elif not content[j].isspace():
                            # Non-whitespace character before semicolon
                            break
                        j += 1
                    break

        i += 1

    return None

def find_table_file(table_name):
    """Find which migration file contains the CREATE TABLE statement for this table."""
    sql_files = glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql"))

    for file_path in sql_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Look for CREATE TABLE statement with this exact table name
            pattern = rf'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?{re.escape(table_name)}\s*\('
            if re.search(pattern, content, re.IGNORECASE):
                return file_path

    return None

def main():
    print(f"Searching for {len(TABLES)} tables in migration files...")

    # Create output file with header
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        out.write("""-- =====================================================
-- ALL MISSING TABLES - Consolidated Migration
-- Created: December 16, 2024
-- Total Tables: 314
-- =====================================================
-- This file consolidates CREATE TABLE statements for all missing tables
-- extracted from existing migration files.
-- =====================================================

""")

    found_count = 0
    missing_tables = []

    for table in TABLES:
        print(f"Processing: {table}")

        # Find the file containing this table
        file_path = find_table_file(table)

        if file_path:
            file_name = os.path.basename(file_path)
            print(f"  Found in: {file_name}")

            # Extract the CREATE TABLE statement
            statement = extract_create_table(file_path, table)

            if statement:
                # Make sure it has IF NOT EXISTS
                if "IF NOT EXISTS" not in statement.upper():
                    statement = re.sub(
                        r'(CREATE\s+TABLE)\s+',
                        r'\1 IF NOT EXISTS ',
                        statement,
                        count=1,
                        flags=re.IGNORECASE
                    )

                with open(OUTPUT_FILE, 'a', encoding='utf-8') as out:
                    out.write(f"\n-- =====================================================\n")
                    out.write(f"-- Table: {table}\n")
                    out.write(f"-- Source: {file_name}\n")
                    out.write(f"-- =====================================================\n")
                    out.write(statement)
                    out.write("\n\n")

                found_count += 1
            else:
                print(f"  WARNING: Could not extract statement")
                missing_tables.append(table)
        else:
            print(f"  NOT FOUND")
            missing_tables.append(table)

    # Add summary
    with open(OUTPUT_FILE, 'a', encoding='utf-8') as out:
        out.write("\n-- =====================================================\n")
        out.write("-- EXTRACTION SUMMARY\n")
        out.write("-- =====================================================\n")
        out.write(f"-- Total tables searched: {len(TABLES)}\n")
        out.write(f"-- Tables found: {found_count}\n")
        out.write(f"-- Tables not found: {len(missing_tables)}\n")
        out.write("-- =====================================================\n")

        if missing_tables:
            out.write("-- TABLES NOT FOUND:\n")
            for table in missing_tables:
                out.write(f"-- - {table}\n")

    print("\n" + "=" * 50)
    print("EXTRACTION COMPLETE!")
    print("=" * 50)
    print(f"Found: {found_count}/{len(TABLES)} tables")
    print(f"Output: {OUTPUT_FILE}")

    if missing_tables:
        print(f"\nTables not found ({len(missing_tables)}):")
        for table in missing_tables:
            print(f"  - {table}")

if __name__ == "__main__":
    main()
