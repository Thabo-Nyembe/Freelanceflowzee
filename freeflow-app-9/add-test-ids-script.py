#!/usr/bin/env python3
"""
Add data-testid attributes to buttons across all dashboard pages
"""

import os
import re

# High-priority pages to add test IDs
PAGES_TO_PROCESS = [
    'plugin-marketplace',
    '3d-modeling',
    'audio-studio',
    'ai-video-generation',
    'team-hub',
    'team-management',
    'workflow-builder',
    'invoices',
    'custom-reports',
    'cloud-storage'
]

BASE_PATH = '/Users/thabonyembe/Documents/freeflow-app-9/app/(app)/dashboard'

def add_test_ids_to_file(file_path, page_name):
    """Add test IDs to buttons in a file"""

    if not os.path.exists(file_path):
        return False, "File not found"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes_made = 0

        # Pattern 1: Install/Uninstall buttons in plugin marketplace
        if page_name == 'plugin-marketplace':
            # Install button
            content = re.sub(
                r'(<button[^>]*onClick=\{[^}]*installPlugin\([^)]+\)[^}]*\}[^>]*)>',
                r'\1 data-testid="install-plugin-btn">',
                content
            )
            # Uninstall button
            content = re.sub(
                r'(<button[^>]*onClick=\{[^}]*uninstallPlugin\([^)]+\)[^}]*\}[^>]*)>',
                r'\1 data-testid="uninstall-plugin-btn">',
                content
            )
            # View mode buttons
            content = re.sub(
                r'(<button[^>]*onClick=\{[^}]*setViewMode\([\'"]grid[\'"]\)[^}]*\}[^>]*)>',
                r'\1 data-testid="grid-view-btn">',
                content
            )
            content = re.sub(
                r'(<button[^>]*onClick=\{[^}]*setViewMode\([\'"]list[\'"]\)[^}]*\}[^>]*)>',
                r'\1 data-testid="list-view-btn">',
                content
            )

        # Pattern 2: Generic action buttons (save, cancel, submit, create, delete, etc.)
        action_patterns = [
            (r'([Ss]ave|[Ss]ubmit)', 'save-btn'),
            (r'([Cc]ancel|[Cc]lose)', 'cancel-btn'),
            (r'([Cc]reate|[Aa]dd|[Nn]ew)', 'create-btn'),
            (r'([Dd]elete|[Rr]emove)', 'delete-btn'),
            (r'([Ee]dit|[Mm]odify)', 'edit-btn'),
            (r'([Ee]xport)', 'export-btn'),
            (r'([Ii]mport)', 'import-btn'),
            (r'([Ss]hare)', 'share-btn'),
            (r'([Dd]ownload)', 'download-btn'),
            (r'([Uu]pload)', 'upload-btn'),
            (r'([Rr]efresh)', 'refresh-btn'),
            (r'([Ss]earch)', 'search-btn'),
            (r'([Ff]ilter)', 'filter-btn'),
        ]

        # Count existing test IDs
        existing_test_ids = len(re.findall(r'data-testid=', content))

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            new_test_ids = len(re.findall(r'data-testid=', content))
            changes_made = new_test_ids - existing_test_ids

            return True, f"Added {changes_made} test IDs"
        else:
            return True, f"Already has {existing_test_ids} test IDs"

    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("🔧 Adding data-testid attributes to buttons...\n")

    for page in PAGES_TO_PROCESS:
        file_path = os.path.join(BASE_PATH, page, 'page.tsx')
        success, message = add_test_ids_to_file(file_path, page)

        status = "✅" if success else "❌"
        print(f"{status} {page}: {message}")

    print("\n✨ Test ID addition complete!")

if __name__ == '__main__':
    main()
