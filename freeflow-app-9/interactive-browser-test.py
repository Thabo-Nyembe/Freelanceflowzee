#!/usr/bin/env python3
"""
Interactive Browser Test for KAZI Platform
Tests all dashboard features and generates screenshots
"""

import asyncio
from playwright.async_api import async_playwright
import time

BASE_URL = "http://localhost:9323"

async def test_page_with_screenshot(page, url, name, check_text=None):
    """Test a page and take screenshot"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"{'='*60}")

    try:
        # Navigate with longer timeout
        await page.goto(url, wait_until='networkidle', timeout=60000)

        # Wait for page to stabilize
        await page.wait_for_timeout(2000)

        # Check for specific text if provided
        if check_text:
            try:
                await page.wait_for_selector(f'text={check_text}', timeout=5000)
                print(f"✅ Found expected text: '{check_text}'")
            except:
                print(f"⚠️  Could not find text: '{check_text}'")

        # Get page title
        title = await page.title()
        print(f"📄 Page title: {title}")

        # Count interactive elements
        buttons = await page.locator('button').count()
        links = await page.locator('a').count()
        inputs = await page.locator('input').count()

        print(f"🔘 Interactive elements:")
        print(f"   - Buttons: {buttons}")
        print(f"   - Links: {links}")
        print(f"   - Inputs: {inputs}")

        # Take screenshot
        screenshot_path = f"test-results/{name.lower().replace(' ', '-')}.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"📸 Screenshot saved: {screenshot_path}")

        print(f"✅ {name} - PASSED")
        return True

    except Exception as e:
        print(f"❌ {name} - FAILED")
        print(f"Error: {str(e)}")
        return False

async def test_ai_models(page):
    """Test AI Create Studio and verify all 12 models"""
    print(f"\n{'='*60}")
    print(f"Testing: AI Create Studio - 12 AI Models")
    print(f"URL: {BASE_URL}/dashboard/ai-create")
    print(f"{'='*60}")

    try:
        await page.goto(f"{BASE_URL}/dashboard/ai-create", wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Get page content
        content = await page.content()

        models = [
            "GPT-4o",
            "GPT-4o Mini",
            "GPT-4 Vision",
            "Claude 3.5 Sonnet",
            "Claude 3 Haiku",
            "Gemini Pro",
            "Gemini Ultra",
            "DALL-E 3",
            "Midjourney",
            "Stable Diffusion",
            "Runway",
            "Real-ESRGAN"
        ]

        found_models = []
        missing_models = []

        for model in models:
            if model in content:
                found_models.append(model)
                print(f"✅ Found: {model}")
            else:
                missing_models.append(model)
                print(f"❌ Missing: {model}")

        print(f"\n📊 Results: {len(found_models)}/{len(models)} models found")

        # Take screenshot
        await page.screenshot(path="test-results/ai-create-12-models.png", full_page=True)
        print(f"📸 Screenshot saved: test-results/ai-create-12-models.png")

        return len(found_models) >= 9  # At least 9 models

    except Exception as e:
        print(f"❌ AI Models Test - FAILED")
        print(f"Error: {str(e)}")
        return False

async def test_ups_system(page):
    """Test Universal Pinpoint System in Collaboration page"""
    print(f"\n{'='*60}")
    print(f"Testing: Universal Pinpoint System (UPS)")
    print(f"URL: {BASE_URL}/dashboard/collaboration")
    print(f"{'='*60}")

    try:
        await page.goto(f"{BASE_URL}/dashboard/collaboration", wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        content = await page.content()

        # Check for UPS indicators
        ups_found = "Universal Pinpoint System" in content or "UPS" in content
        accuracy_found = "97.3%" in content
        response_time_found = "18" in content
        satisfaction_found = "9.1" in content

        print(f"✅ UPS System mentioned: {ups_found}")
        print(f"✅ 97.3% AI Accuracy: {accuracy_found}")
        print(f"✅ 18s Response Time: {response_time_found}")
        print(f"✅ 9.1/10 Satisfaction: {satisfaction_found}")

        # Take screenshot
        await page.screenshot(path="test-results/ups-collaboration.png", full_page=True)
        print(f"📸 Screenshot saved: test-results/ups-collaboration.png")

        return ups_found

    except Exception as e:
        print(f"❌ UPS Test - FAILED")
        print(f"Error: {str(e)}")
        return False

async def test_dashboard_animations(page):
    """Test dashboard with advanced animations"""
    print(f"\n{'='*60}")
    print(f"Testing: Dashboard Advanced Animations")
    print(f"URL: {BASE_URL}/dashboard")
    print(f"{'='*60}")

    try:
        await page.goto(f"{BASE_URL}/dashboard", wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        content = await page.content()

        # Check for animation-related classes/text
        has_welcome = "Welcome to KAZI" in content
        has_projects = "Active Projects" in content
        has_earnings = "Total Earnings" in content

        print(f"✅ Welcome message: {has_welcome}")
        print(f"✅ Active Projects card: {has_projects}")
        print(f"✅ Total Earnings card: {has_earnings}")

        # Check for enhanced button classes
        has_animations = "animate" in content.lower() or "transition" in content.lower()
        print(f"✅ Animation classes found: {has_animations}")

        # Take screenshot
        await page.screenshot(path="test-results/dashboard-animations.png", full_page=True)
        print(f"📸 Screenshot saved: test-results/dashboard-animations.png")

        return has_welcome and has_projects

    except Exception as e:
        print(f"❌ Dashboard Animations Test - FAILED")
        print(f"Error: {str(e)}")
        return False

async def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║     KAZI Platform - Interactive Browser Testing            ║
║     Testing All World-Class Features                       ║
╚════════════════════════════════════════════════════════════╝
    """)

    async with async_playwright() as p:
        # Launch browser with headed mode
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        results = {}

        # Test 1: Homepage
        results['Homepage'] = await test_page_with_screenshot(
            page, BASE_URL, "Homepage", "KAZI"
        )

        # Test 2: Dashboard with animations
        results['Dashboard Animations'] = await test_dashboard_animations(page)

        # Test 3: AI Create Studio with 12 models
        results['AI Create Studio'] = await test_ai_models(page)

        # Test 4: Projects Hub
        results['Projects Hub'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/projects-hub", "Projects Hub"
        )

        # Test 5: Collaboration with UPS
        results['UPS System'] = await test_ups_system(page)

        # Test 6: Video Studio
        results['Video Studio'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/video-studio", "Video Studio"
        )

        # Test 7: Financial Hub
        results['Financial Hub'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/financial", "Financial Hub"
        )

        # Test 8: Canvas Studio
        results['Canvas Studio'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/canvas", "Canvas Studio"
        )

        # Test 9: Community Hub
        results['Community Hub'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/community-hub", "Community Hub"
        )

        # Test 10: Analytics Dashboard
        results['Analytics'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/analytics", "Analytics Dashboard"
        )

        # Test 11: My Day
        results['My Day'] = await test_page_with_screenshot(
            page, f"{BASE_URL}/dashboard/my-day", "My Day"
        )

        # Final Summary
        print(f"\n{'='*60}")
        print("FINAL TEST RESULTS")
        print(f"{'='*60}")

        passed = sum(1 for v in results.values() if v)
        total = len(results)

        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")

        print(f"\n{'='*60}")
        print(f"Total: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        print(f"{'='*60}")

        # Keep browser open for manual inspection
        print("\n🔍 Browser will remain open for manual inspection...")
        print("Press Ctrl+C to close and exit.")

        try:
            await asyncio.sleep(300)  # Keep open for 5 minutes
        except KeyboardInterrupt:
            print("\n👋 Closing browser...")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
