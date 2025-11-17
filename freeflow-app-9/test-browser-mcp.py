#!/usr/bin/env python3
"""
KAZI Platform Comprehensive Browser Testing
Using Playwright for interactive testing
"""

import asyncio
import sys
from playwright.async_api import async_playwright

async def test_kazi_platform():
    """Comprehensive browser test for KAZI platform"""
    results = {
        "homepage": {"status": "pending", "details": []},
        "dashboard": {"status": "pending", "details": []},
        "ai_create": {"status": "pending", "details": []},
        "ups_system": {"status": "pending", "details": []},
        "micro_features": {"status": "pending", "details": []},
        "all_pages": {"status": "pending", "details": []}
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        BASE_URL = "http://localhost:9323"

        try:
            # Test 1: Homepage
            print("🧪 Testing Homepage...")
            await page.goto(f"{BASE_URL}/")
            await page.wait_for_load_state('networkidle', timeout=10000)

            title = await page.title()
            has_kazi = "KAZI" in await page.content()

            results["homepage"]["status"] = "✅ PASS" if has_kazi else "❌ FAIL"
            results["homepage"]["details"] = [
                f"Title: {title}",
                f"Contains KAZI branding: {has_kazi}"
            ]
            print(f"   Homepage: {results['homepage']['status']}")

            # Test 2: Dashboard with micro-features
            print("🧪 Testing Dashboard...")
            await page.goto(f"{BASE_URL}/dashboard")
            await page.wait_for_selector('h1', timeout=15000)

            welcome_text = await page.locator('h1:has-text("Welcome to KAZI")').count()
            stats_cards = await page.locator('text="Total Earnings"').count()

            results["dashboard"]["status"] = "✅ PASS" if welcome_text > 0 else "❌ FAIL"
            results["dashboard"]["details"] = [
                f"Welcome heading visible: {welcome_text > 0}",
                f"Stats cards present: {stats_cards > 0}"
            ]
            print(f"   Dashboard: {results['dashboard']['status']}")

            # Test 3: AI Create Studio with 12 models
            print("🧪 Testing AI Create Studio (12 AI Models)...")
            await page.goto(f"{BASE_URL}/dashboard/ai-create")
            await page.wait_for_load_state('networkidle', timeout=15000)

            content = await page.content()
            has_ai_create = "AI Create" in content or "GPT" in content

            # Check for model mentions
            model_checks = {
                "GPT-4o": "GPT-4o" in content or "gpt-4o" in content,
                "Claude": "Claude" in content,
                "Gemini": "Gemini" in content,
                "DALL-E": "DALL-E" in content or "dall-e" in content,
                "Midjourney": "Midjourney" in content or "midjourney" in content,
            }

            models_found = sum(1 for found in model_checks.values() if found)

            results["ai_create"]["status"] = "✅ PASS" if has_ai_create else "❌ FAIL"
            results["ai_create"]["details"] = [
                f"AI Create page loaded: {has_ai_create}",
                f"Models found: {models_found}/5 key models",
            ] + [f"{model}: {'✅' if found else '❌'}" for model, found in model_checks.items()]
            print(f"   AI Create: {results['ai_create']['status']}")

            # Test 4: Universal Pinpoint System
            print("🧪 Testing Universal Pinpoint System (UPS)...")
            await page.goto(f"{BASE_URL}/dashboard/collaboration")
            await page.wait_for_load_state('networkidle', timeout=15000)

            # Click Feedback tab
            feedback_tab = page.locator('button:has-text("Feedback")')
            if await feedback_tab.count() > 0:
                await feedback_tab.click()
                await page.wait_for_timeout(1000)

            has_ups = await page.locator('text="Universal Pinpoint System"').count()
            has_stats = await page.locator('text="97.3%"').count()
            has_response_time = await page.locator('text="18s"').count()
            has_satisfaction = await page.locator('text="9.1/10"').count()

            results["ups_system"]["status"] = "✅ PASS" if has_ups > 0 else "❌ FAIL"
            results["ups_system"]["details"] = [
                f"UPS title visible: {has_ups > 0}",
                f"AI Accuracy stat (97.3%): {has_stats > 0}",
                f"Response time stat (18s): {has_response_time > 0}",
                f"Satisfaction stat (9.1/10): {has_satisfaction > 0}"
            ]
            print(f"   UPS System: {results['ups_system']['status']}")

            # Test 5: Micro Features Showcase
            print("🧪 Testing Micro Features Showcase...")
            await page.goto(f"{BASE_URL}/dashboard/micro-features-showcase")
            await page.wait_for_load_state('networkidle', timeout=15000)

            has_title = await page.locator('text=/Micro.*Features/i').count()
            has_animations_tab = await page.locator('button:has-text("Animations")').count()
            has_interactions_tab = await page.locator('button:has-text("Interactions")').count()
            has_feedback_tab = await page.locator('button:has-text("Feedback")').count()
            has_accessibility_tab = await page.locator('button:has-text("Accessibility")').count()

            # Test tab interaction
            if has_interactions_tab > 0:
                await page.locator('button:has-text("Interactions")').click()
                await page.wait_for_timeout(500)
                has_magnetic_btn = await page.locator('text="Magnetic"').count()
            else:
                has_magnetic_btn = 0

            results["micro_features"]["status"] = "✅ PASS" if has_title > 0 else "❌ FAIL"
            results["micro_features"]["details"] = [
                f"Page loaded: {has_title > 0}",
                f"Animations tab: {has_animations_tab > 0}",
                f"Interactions tab: {has_interactions_tab > 0}",
                f"Feedback tab: {has_feedback_tab > 0}",
                f"Accessibility tab: {has_accessibility_tab > 0}",
                f"Interactive buttons: {has_magnetic_btn > 0}"
            ]
            print(f"   Micro Features: {results['micro_features']['status']}")

            # Test 6: All major pages load
            print("🧪 Testing All Major Pages...")
            pages_to_test = [
                ("/dashboard/projects-hub", "Projects Hub"),
                ("/dashboard/video-studio", "Video Studio"),
                ("/dashboard/financial", "Financial Hub"),
                ("/dashboard/community-hub", "Community Hub"),
                ("/dashboard/analytics", "Analytics"),
                ("/dashboard/my-day", "My Day"),
                ("/dashboard/canvas", "Canvas"),
                ("/dashboard/bookings", "Bookings"),
            ]

            pages_passed = 0
            page_results = []

            for test_page, page_name in pages_to_test:
                try:
                    await page.goto(f"{BASE_URL}{test_page}", timeout=12000)
                    await page.wait_for_load_state('networkidle', timeout=10000)

                    # Check for errors
                    has_error = await page.locator('text=/error|failed/i').count()
                    has_content = len(await page.content()) > 1000

                    passed = has_error == 0 and has_content

                    if passed:
                        pages_passed += 1

                    status = "✅" if passed else "❌"
                    page_results.append(f"{status} {page_name}")
                    print(f"      {status} {page_name}")

                except Exception as e:
                    page_results.append(f"❌ {page_name} - Timeout/Error")
                    print(f"      ❌ {page_name} - Error")

            results["all_pages"]["status"] = f"{'✅ PASS' if pages_passed >= 6 else '⚠️  PARTIAL'} ({pages_passed}/{len(pages_to_test)})"
            results["all_pages"]["details"] = page_results
            print(f"   All Pages: {results['all_pages']['status']}")

        except Exception as e:
            print(f"❌ Test error: {str(e)}")
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()

    return results

async def main():
    """Main test runner"""
    print("\n" + "="*70)
    print("🚀 KAZI PLATFORM - COMPREHENSIVE BROWSER TEST SUITE")
    print("="*70 + "\n")

    results = await test_kazi_platform()

    # Print detailed summary
    print("\n" + "="*70)
    print("🎯 DETAILED TEST RESULTS")
    print("="*70)

    for test_name, test_result in results.items():
        print(f"\n📋 {test_name.replace('_', ' ').title()}: {test_result['status']}")
        for detail in test_result['details']:
            print(f"   • {detail}")

    # Count passes
    full_passes = sum(1 for r in results.values() if "✅ PASS" in r['status'])
    partial_passes = sum(1 for r in results.values() if "⚠️" in r['status'])
    total = len(results)

    print("\n" + "="*70)
    print(f"🏆 FINAL SCORE: {full_passes}/{total} fully passed, {partial_passes} partial")
    print("="*70)

    # Return exit code
    return 0 if full_passes >= 4 else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
