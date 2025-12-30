#!/usr/bin/env python3
"""Verify the SQL file has valid syntax and structure"""

import re
from pathlib import Path

SQL_FILE = "/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations/20241216000010_all_missing_tables.sql"

def verify_sql_file():
    with open(SQL_FILE, 'r') as f:
        content = f.read()

    # Count CREATE TABLE statements
    create_table_count = len(re.findall(r'CREATE TABLE IF NOT EXISTS', content, re.IGNORECASE))

    # Check for balanced parentheses
    paren_balance = content.count('(') - content.count(')')

    # Check for statements ending with semicolon
    table_statements = re.findall(r'CREATE TABLE IF NOT EXISTS.*?;', content, re.DOTALL | re.IGNORECASE)

    # Find potential syntax issues
    issues = []

    # Check each table has closing semicolon
    unclosed = re.findall(r'CREATE TABLE IF NOT EXISTS ([a-z_]+)', content, re.IGNORECASE)
    closed = [re.search(r'CREATE TABLE IF NOT EXISTS ([a-z_]+)', stmt, re.IGNORECASE).group(1) 
              for stmt in table_statements]

    missing_semicolons = set(unclosed) - set(closed)

    if paren_balance != 0:
        issues.append(f"⚠️  Unbalanced parentheses: {paren_balance}")

    if missing_semicolons:
        issues.append(f"⚠️  Tables possibly missing semicolons: {missing_semicolons}")

    # Report
    print("=" * 60)
    print("SQL FILE VERIFICATION")
    print("=" * 60)
    print(f"File: {SQL_FILE}")
    print(f"Size: {Path(SQL_FILE).stat().st_size / 1024:.2f} KB")
    print()
    print(f"✓ CREATE TABLE statements found: {create_table_count}")
    print(f"✓ Complete table definitions: {len(table_statements)}")
    print(f"✓ Parentheses balance: {'OK' if paren_balance == 0 else f'FAIL ({paren_balance})'}")
    print()

    if issues:
        print("Issues Found:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("✅ No syntax issues detected!")

    print()
    print("Sample table names:")
    for name in closed[:10]:
        print(f"  - {name}")
    print(f"  ... and {len(closed) - 10} more")

    return len(issues) == 0

if __name__ == "__main__":
    success = verify_sql_file()
    exit(0 if success else 1)
