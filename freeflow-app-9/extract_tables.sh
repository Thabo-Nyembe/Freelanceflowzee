#!/bin/bash

# Extract CREATE TABLE statements for missing tables
# This script searches through all migration files and extracts complete table definitions

MIGRATIONS_DIR="/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations"
OUTPUT_FILE="/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations/20241216000010_all_missing_tables.sql"

# List of all missing tables
TABLES=(
    "access_logs" "activity_logs" "add_ons" "admin_settings" "advisory_analytics"
    "advisory_sessions" "ai_brand_assets" "ai_brand_guidelines" "ai_brand_voices"
    "ai_collection_images" "ai_color_palettes" "ai_content_templates" "ai_content_variations"
    "ai_create_api_keys" "ai_create_collaboration_sessions" "ai_create_cost_tracking"
    "ai_create_file_uploads" "ai_create_generation_history" "ai_create_model_usage"
    "ai_create_templates" "ai_design_concepts" "ai_designs" "ai_email_sequences"
    "ai_enhanced_tools" "ai_generated_content" "ai_generated_copy" "ai_generated_images"
    "ai_image_collections" "ai_image_presets" "ai_model_configs" "ai_swipe_file"
    "ai_usage_daily" "alerts" "allocations" "analytics" "analytics_alerts" "animations"
    "announcements" "api_endpoints" "api_request_logs" "app_reviews" "asset_collections"
    "attribution_touchpoints" "audience_analytics" "audit_alert_rules" "audit_events"
    "audit_findings" "automation" "automations" "backup_logs" "backups" "billing"
    "broadcasts" "budgets" "bug_comments" "bugs" "build_artifacts" "build_pipelines"
    "builds" "bulk_operations" "business_reports" "campaigns" "canvas" "capacity"
    "certifications" "changelog" "chat" "churn_analytics" "ci_cd" "client_contacts"
    "client_reviews" "client_satisfaction_metrics" "client_shares" "cloud_storage"
    "collab_document_comments" "collaboration" "collaboration_events" "collaboration_invites"
    "community" "community_analytics" "community_likes" "community_shares" "compliance"
    "compliance_checks" "compliance_findings" "compliance_reports" "connectors" "content"
    "content_analytics" "content_studio" "contracts" "cost_tracking" "courses"
    "creator_profiles" "creator_reviews" "crm_activities" "crm_contacts" "crm_deal_products"
    "crm_deals" "crm_leads" "crm_notes" "customer_ltv" "customer_success" "customers"
    "daily_analytics" "data_exports" "dependencies" "deployments" "desktop_apps"
    "digital_assets" "direct_messages" "docs" "documentation" "email_agent_approvals"
    "email_agent_config" "email_agent_messages" "email_agent_responses" "employee_payroll"
    "employees" "engagement_metrics" "event_registrations" "events" "export_presets"
    "extensions" "faqs" "features" "feedback" "file_activity" "file_cache" "file_metadata"
    "financial" "fleet_vehicles" "focus_sessions" "forms" "gallery_items" "growth_forecasts"
    "guest_upload_analytics" "guest_upload_payments" "health_scores" "help_article_feedback"
    "help_articles" "help_categories" "help_docs" "integration_preferences" "inventory"
    "invoice_analytics_daily" "invoice_clients" "invoice_events" "invoice_payment_links"
    "job_applications" "job_postings" "kb_article_feedback" "kb_article_versions"
    "kb_article_views" "kb_articles" "kb_bookmarks" "kb_categories" "kb_faqs"
    "kb_search_queries" "kb_suggested_topics" "kb_video_feedback" "kb_video_tutorials"
    "kb_video_views" "knowledge_articles" "knowledge_base" "lead_activities" "leads"
    "logistics_routes" "maintenance_tasks" "maintenance_windows" "marketing_channels"
    "marketplace_apps" "marketplace_integrations" "marketplace_reviews" "media_files"
    "media_folders" "milestone_deliverables" "mobile_app_features" "mobile_app_versions"
    "my_day_tasks" "newsletter_subscriptions" "onboarding_programs" "onboarding_tasks"
    "order_items" "orders" "organizations" "payroll_runs" "performance_alerts"
    "performance_analytics" "performance_benchmarks" "performance_goals" "performance_snapshots"
    "permissions" "polls" "portfolio_video_analytics" "portfolio_videos" "pricing_plans"
    "pricing_recommendations" "product_variants" "products" "project_activity"
    "project_analyses" "project_files" "project_tasks" "public" "qa_test_cases"
    "qa_test_executions" "rate_limit_tiers" "recommendation_feedback" "recommendation_history"
    "recommendation_preferences" "release_notes" "releases" "renewals" "report_filters"
    "report_shares" "report_widgets" "resource_skills" "resource_usage_logs" "revenue_analytics"
    "revenue_entries" "review_approvals" "review_collaborators" "review_notifications"
    "review_sessions" "review_stages" "review_templates" "roadmap_initiatives"
    "roadmap_milestones" "role_assignments" "roles" "route_stops" "sales_activities"
    "sales_deals" "sales_pipeline_stages" "security_audits" "seo_backlinks" "seo_keywords"
    "seo_pages" "server_metrics" "servers" "session_messages" "share_access_logs"
    "share_analytics" "share_links" "shipment_tracking" "shipments" "shipping_carriers"
    "skills_performance" "social_accounts" "social_analytics" "social_posts" "sprint_tasks"
    "sprints" "stock_levels" "stock_movements" "storage_analytics" "storage_optimization_jobs"
    "storage_tiers" "store_apps" "support_agents" "support_channels" "support_conversations"
    "support_ticket_replies" "support_tickets" "survey_questions" "survey_responses"
    "surveys" "system_insights" "system_logs" "team_management" "team_performance"
    "team_shares" "templates" "test_run_results" "themes" "third_party_integrations"
    "three_d_models" "ticket_messages" "time_tracking" "training_enrollments" "training_programs"
    "trash" "tutorials" "ui_components" "upf_analytics" "upf_attachments" "upf_reactions"
    "upf_voice_notes" "user_activity_logs" "user_cohorts" "user_management" "user_metrics"
    "user_settings" "video_daily_analytics" "video_encoding_jobs" "video_engagement_events"
    "video_events" "video_folders" "video_usage_logs" "video_views" "video_watch_time"
    "voice_clones" "voice_projects" "voice_scripts" "voice_syntheses" "voices"
    "vulnerabilities" "vulnerability_scans" "warehouse_zones" "warehouses"
    "webhook_event_types" "webinars" "workflow_steps"
)

# Create output file with header
cat > "$OUTPUT_FILE" << 'EOF'
-- =====================================================
-- ALL MISSING TABLES - Consolidated Migration
-- Created: December 16, 2024
-- Total Tables: 314
-- =====================================================
-- This file consolidates CREATE TABLE statements for all missing tables
-- extracted from existing migration files.
-- =====================================================

EOF

echo "Searching for ${#TABLES[@]} tables in migration files..."

found_count=0
missing_tables=()

for table in "${TABLES[@]}"; do
    echo "Searching for: $table"

    # Search for the table in all migration files (case-insensitive)
    result=$(cd "$MIGRATIONS_DIR" && grep -l "CREATE TABLE.*\b${table}\b" *.sql 2>/dev/null | head -1)

    if [ -n "$result" ]; then
        echo "  Found in: $result"

        # Extract the complete CREATE TABLE statement
        # This is tricky - we need to get from CREATE TABLE to the semicolon after all constraints/indexes

        # Add comment to output file
        echo "" >> "$OUTPUT_FILE"
        echo "-- =====================================================" >> "$OUTPUT_FILE"
        echo "-- Table: $table" >> "$OUTPUT_FILE"
        echo "-- Source: $result" >> "$OUTPUT_FILE"
        echo "-- =====================================================" >> "$OUTPUT_FILE"

        # Use awk to extract the table definition
        awk -v table="$table" '
            BEGIN { capturing = 0; paren_count = 0; }
            /CREATE TABLE.*\b'$table'\b/ {
                capturing = 1;
                print;
                # Count parentheses in this line
                for (i=1; i<=length($0); i++) {
                    c = substr($0, i, 1);
                    if (c == "(") paren_count++;
                    if (c == ")") paren_count--;
                }
                next;
            }
            capturing == 1 {
                print;
                # Count parentheses
                for (i=1; i<=length($0); i++) {
                    c = substr($0, i, 1);
                    if (c == "(") paren_count++;
                    if (c == ")") paren_count--;
                }
                # If we hit the closing paren and semicolon, stop
                if (paren_count == 0 && /;/) {
                    capturing = 0;
                }
            }
        ' "$MIGRATIONS_DIR/$result" >> "$OUTPUT_FILE"

        echo "" >> "$OUTPUT_FILE"

        ((found_count++))
    else
        echo "  NOT FOUND"
        missing_tables+=("$table")
    fi
done

# Add summary at the end
echo "" >> "$OUTPUT_FILE"
echo "-- =====================================================" >> "$OUTPUT_FILE"
echo "-- EXTRACTION SUMMARY" >> "$OUTPUT_FILE"
echo "-- =====================================================" >> "$OUTPUT_FILE"
echo "-- Total tables searched: ${#TABLES[@]}" >> "$OUTPUT_FILE"
echo "-- Tables found: $found_count" >> "$OUTPUT_FILE"
echo "-- Tables not found: ${#missing_tables[@]}" >> "$OUTPUT_FILE"
echo "-- =====================================================" >> "$OUTPUT_FILE"

if [ ${#missing_tables[@]} -gt 0 ]; then
    echo "-- TABLES NOT FOUND:" >> "$OUTPUT_FILE"
    for table in "${missing_tables[@]}"; do
        echo "-- - $table" >> "$OUTPUT_FILE"
    done
fi

echo ""
echo "==================================="
echo "EXTRACTION COMPLETE!"
echo "==================================="
echo "Found: $found_count/${#TABLES[@]} tables"
echo "Output: $OUTPUT_FILE"
echo ""

if [ ${#missing_tables[@]} -gt 0 ]; then
    echo "Tables not found (${#missing_tables[@]}):"
    printf '%s\n' "${missing_tables[@]}"
fi
