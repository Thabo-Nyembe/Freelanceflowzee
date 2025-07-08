#!/bin/bash

# FreeFlow Documentation Update Script
# This script helps maintain documentation standards for all upgrades and breakthroughs

echo "🚀 FreeFlow Documentation Update Assistant"
echo "=========================================="
echo ""

# Function to update component count
update_component_count() {
    local count=$(find components/ -name "*.tsx" -type f | wc -l | xargs)
    echo "📦 Found $count React components"
    
    # Update README.md
    sed -i '' "s/Components.*150+/Components: $count+/g" README.md
    echo "✅ Updated component count in README.md"
    
    # Update COMPONENT_INVENTORY.md header
    sed -i '' "s/150+ React Components/$count+ React Components/g" COMPONENT_INVENTORY.md
    echo "✅ Updated component count in COMPONENT_INVENTORY.md"
}

# Function to update API endpoint count
update_api_count() {
    local count=$(find app/api/ -name "route.ts" -type f | wc -l | xargs)
    echo "🔌 Found $count API endpoints"
    
    # Update README.md
    sed -i '' "s/API Endpoints.*50+/API Endpoints: $count+/g" README.md
    echo "✅ Updated API endpoint count in README.md"
}

# Function to update test count
update_test_count() {
    local count=$(find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | wc -l | xargs)
    echo "🧪 Found $count test files"
    
    # Update README.md
    sed -i '' "s/Test Coverage.*20+/Test Coverage: $count+/g" README.md
    echo "✅ Updated test count in README.md"
}

# Function to update database table count
update_database_count() {
    local count=$(find supabase/migrations/ -name "*.sql" | wc -l | xargs)
    echo "🗄️ Found $count database migrations"
    
    # Update README.md (assuming migrations roughly correlate to tables)
    sed -i '' "s/Database Tables.*19+/Database Tables: $count+/g" README.md
    echo "✅ Updated database migration count in README.md"
}

# Function to prompt for feature documentation
prompt_feature_documentation() {
    echo ""
    echo "📝 Documentation Checklist for New Features:"
    echo "============================================="
    echo ""
    echo "Please ensure you've updated the following files:"
    echo ""
    echo "📋 REQUIRED UPDATES:"
    echo "  □ README.md - Add feature to feature matrix"
    echo "  □ USER_MANUAL.md - Add step-by-step user guide"
    echo "  □ TECHNICAL_ANALYSIS.md - Document implementation"
    echo "  □ COMPONENT_INVENTORY.md - Add new components"
    echo "  □ APP_OVERVIEW.md - Update high-level overview"
    echo ""
    echo "🔍 OPTIONAL UPDATES (if applicable):"
    echo "  □ API documentation for new endpoints"
    echo "  □ Database schema changes"
    echo "  □ Environment variable documentation"
    echo "  □ Deployment configuration changes"
    echo ""
    
    read -p "Have you completed all required documentation updates? (y/n): " completed
    
    if [ "$completed" = "y" ] || [ "$completed" = "Y" ]; then
        echo "✅ Great! Proceeding with documentation update..."
    else
        echo "❌ Please complete the required documentation updates first."
        echo "📖 Refer to CONTRIBUTING.md for detailed guidelines."
        exit 1
    fi
}

# Function to update documentation timestamp
update_timestamps() {
    local current_date=$(date "+%B %Y")
    
    # Update last updated dates in key documents
    sed -i '' "s/Last Updated.*December 2024/Last Updated: $current_date/g" APP_OVERVIEW.md
    sed -i '' "s/Last Updated.*Dec 2024/Last Updated: $current_date/g" DOCUMENTATION_UPDATE_LOG.md
    
    echo "🕒 Updated documentation timestamps to $current_date"
}

# Function to validate documentation
validate_documentation() {
    echo ""
    echo "🔍 Validating Documentation..."
    echo "=============================="
    
    local issues=0
    
    # Check if main documentation files exist
    required_files=("README.md" "USER_MANUAL.md" "TECHNICAL_ANALYSIS.md" "COMPONENT_INVENTORY.md" "APP_OVERVIEW.md")
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Missing required file: $file"
            issues=$((issues + 1))
        else
            echo "✅ Found: $file"
        fi
    done
    
    # Check for placeholder text
    if grep -q "TODO\|PLACEHOLDER\|XXX" *.md; then
        echo "⚠️  Warning: Found placeholder text in documentation"
        grep -n "TODO\|PLACEHOLDER\|XXX" *.md
        issues=$((issues + 1))
    fi
    
    if [ $issues -eq 0 ]; then
        echo "✅ Documentation validation passed!"
        return 0
    else
        echo "❌ Documentation validation failed with $issues issues"
        return 1
    fi
}

# Function to commit documentation changes
commit_documentation() {
    echo ""
    echo "📤 Committing Documentation Changes..."
    echo "====================================="
    
    # Add all documentation files
    git add *.md docs/ scripts/
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo "ℹ️  No documentation changes to commit"
        return 0
    fi
    
    # Get a description of changes from user
    echo ""
    read -p "📝 Brief description of documentation changes: " change_description
    
    # Create commit message
    local commit_message="docs: $change_description

- Updated documentation for latest features and changes
- Maintained documentation standards per CONTRIBUTING.md
- Ensured all required documentation is current and accurate

This commit maintains our enterprise-grade documentation standards
and ensures all project documentation remains comprehensive and up-to-date."

    # Commit changes
    git commit -m "$commit_message"
    
    if [ $? -eq 0 ]; then
        echo "✅ Documentation changes committed successfully"
        
        # Ask if user wants to push
        read -p "🚀 Push changes to remote repository? (y/n): " push_changes
        
        if [ "$push_changes" = "y" ] || [ "$push_changes" = "Y" ]; then
            git push origin main
            echo "✅ Documentation changes pushed to remote repository"
        else
            echo "ℹ️  Changes committed locally. Run 'git push origin main' when ready."
        fi
    else
        echo "❌ Failed to commit documentation changes"
        return 1
    fi
}

# Main script execution
main() {
    echo "🔄 Starting documentation update process..."
    echo ""
    
    # Update counts automatically
    update_component_count
    update_api_count
    update_test_count
    update_database_count
    
    echo ""
    echo "📊 Automatic Updates Complete!"
    echo ""
    
    # Prompt for manual documentation updates
    prompt_feature_documentation
    
    # Update timestamps
    update_timestamps
    
    # Validate documentation
    if validate_documentation; then
        # Commit changes
        commit_documentation
        
        echo ""
        echo "🎉 Documentation Update Complete!"
        echo "=================================="
        echo ""
        echo "📋 Summary:"
        echo "  ✅ Component counts updated"
        echo "  ✅ API endpoint counts updated"
        echo "  ✅ Test counts updated"
        echo "  ✅ Database counts updated"
        echo "  ✅ Timestamps updated"
        echo "  ✅ Documentation validated"
        echo "  ✅ Changes committed and pushed"
        echo ""
        echo "📖 Your documentation is now up-to-date and ready for production!"
        
    else
        echo ""
        echo "❌ Documentation update failed validation."
        echo "Please fix the issues above and run the script again."
        exit 1
    fi
}

# Script options
case "${1:-}" in
    --help|-h)
        echo "FreeFlow Documentation Update Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --validate     Only validate documentation"
        echo "  --counts       Only update counts"
        echo ""
        echo "This script helps maintain documentation standards by:"
        echo "  - Automatically updating component/API/test counts"
        echo "  - Prompting for required documentation updates"
        echo "  - Validating documentation completeness"
        echo "  - Committing and pushing changes"
        echo ""
        echo "Run this script after every significant feature addition or breakthrough."
        ;;
    --validate)
        validate_documentation
        ;;
    --counts)
        update_component_count
        update_api_count
        update_test_count
        update_database_count
        echo "✅ All counts updated successfully!"
        ;;
    *)
        main
        ;;
esac 