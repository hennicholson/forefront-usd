import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness Tests', () => {
  test('homepage should load and display header', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that page loads
    await expect(page).toHaveTitle(/forefront/i)

    // Check header is visible
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check logo is visible
    const logo = page.getByText('[forefront]')
    await expect(logo).toBeVisible()
  })

  test('mobile menu should work on small screens', async ({ page, viewport }) => {
    await page.goto('/')

    // Only test mobile menu on viewports narrower than 768px
    if (viewport && viewport.width < 768) {
      // Hamburger menu button should be visible on mobile
      const hamburger = page.locator('.mobile-menu-button')
      await expect(hamburger).toBeVisible()

      // Desktop nav should be hidden on mobile
      const desktopNav = page.locator('.desktop-nav')
      await expect(desktopNav).not.toBeVisible()

      // Click hamburger to open mobile menu
      await hamburger.click()

      // Mobile menu should be visible
      const mobileMenu = page.locator('.mobile-menu')
      await expect(mobileMenu).toBeVisible()

      // Check mobile menu contains navigation links
      await expect(mobileMenu.getByText('modules')).toBeVisible()
      await expect(mobileMenu.getByText('network')).toBeVisible()
      await expect(mobileMenu.getByText('about')).toBeVisible()
    }
  })

  test('desktop nav should work on larger screens', async ({ page, viewport }) => {
    await page.goto('/')

    // Only test desktop nav on viewports wider than 768px
    if (viewport && viewport.width >= 768) {
      // Desktop nav should be visible
      const desktopNav = page.locator('.desktop-nav')
      await expect(desktopNav).toBeVisible()

      // Hamburger should be hidden
      const hamburger = page.locator('.mobile-menu-button')
      await expect(hamburger).not.toBeVisible()
    }
  })

  test('about page should be accessible', async ({ page }) => {
    await page.goto('/about')

    // Check header is visible
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Page content should be visible
    await expect(page.getByText(/about/i)).toBeVisible()
  })

  test('network page should be accessible', async ({ page }) => {
    await page.goto('/network')

    // Check header is visible
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('dashboard redirects when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to home if not authenticated
    await page.waitForURL('/')

    // Header should still be visible
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('mobile menu navigation works', async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 768) {
      // Skip this test on non-mobile viewports
      test.skip()
    }

    await page.goto('/')

    // Open mobile menu
    const hamburger = page.locator('.mobile-menu-button')
    await hamburger.click()

    // Click on "about" link
    const mobileMenu = page.locator('.mobile-menu')
    await mobileMenu.getByText('about').click()

    // Should navigate to about page
    await page.waitForURL('/about')

    // Menu should close after navigation
    await expect(mobileMenu).not.toBeVisible()
  })
})
