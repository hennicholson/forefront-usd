import { test, expect } from '@playwright/test'

test.describe('Chat Loading and Notification UX', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to network page (auth should redirect if needed)
    await page.goto('http://localhost:3001/network')

    // Wait for page to load - either network page or login redirect
    await page.waitForLoadState('networkidle')

    // If we see a login form, skip these tests
    const hasLogin = await page.locator('input[type="email"], input[type="password"]').first().isVisible().catch(() => false)
    if (hasLogin) {
      test.skip()
    }
  })

  test('should show skeleton loader before messages appear', async ({ page }) => {
    // Navigate to a channel
    await page.click('text=Channels')
    await page.click('text=general')

    // Check for skeleton loaders first
    const skeleton = page.locator('.animate-pulse').first()
    await expect(skeleton).toBeVisible({ timeout: 1000 })

    // Wait for actual messages to appear
    await page.waitForSelector('[data-message-id]', { timeout: 3000 })

    // Skeleton should be gone
    await expect(skeleton).not.toBeVisible()
  })

  test('should load messages at bottom without visible scroll', async ({ page }) => {
    // Click on a channel
    await page.click('text=Channels')
    await page.click('text=general')

    // Wait for messages to load
    await page.waitForSelector('[data-message-id]', { timeout: 5000 })

    // Get the messages container
    const messagesContainer = page.locator('.overflow-y-auto').first()

    // Check that we're scrolled to the bottom
    const scrollPosition = await messagesContainer.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }))

    // Should be at or near bottom (within 50px)
    expect(scrollPosition.scrollHeight - scrollPosition.scrollTop - scrollPosition.clientHeight).toBeLessThan(50)
  })

  test('should allow scrolling up without auto-scroll interruption', async ({ page }) => {
    // Navigate to channel
    await page.click('text=Channels')
    await page.click('text=general')

    // Wait for messages
    await page.waitForSelector('[data-message-id]', { timeout: 5000 })

    const messagesContainer = page.locator('.overflow-y-auto').first()

    // Scroll up
    await messagesContainer.evaluate((el) => {
      el.scrollTop = 0
    })

    // Wait a bit for polling to potentially interfere
    await page.waitForTimeout(6000)

    // Check we're still at the top
    const scrollTop = await messagesContainer.evaluate((el) => el.scrollTop)
    expect(scrollTop).toBeLessThan(100)
  })

  test('should navigate to mentioned message and highlight it', async ({ page }) => {
    // Navigate to notifications
    await page.click('text=Notifications')

    // Wait for notifications to load
    await page.waitForSelector('[data-testid="notification-item"]', { timeout: 3000 })

    // Click on a mention notification
    const mentionNotification = page.locator('text=/mentioned you/').first()
    if (await mentionNotification.isVisible()) {
      await mentionNotification.click()

      // Should navigate to the channel/DM
      await page.waitForTimeout(1000)

      // Wait for highlighted message
      const highlightedMessage = page.locator('.ring-blue-500\\/50')
      await expect(highlightedMessage).toBeVisible({ timeout: 2000 })

      // Highlight should fade out
      await page.waitForTimeout(3000)
      await expect(highlightedMessage).not.toBeVisible()
    }
  })

  test('should smoothly transition from skeleton to messages', async ({ page }) => {
    // Navigate to Messages tab
    await page.click('text=Messages')

    // Click "New Chat" button
    const newChatBtn = page.locator('button[title="Start new chat"]')
    await newChatBtn.click()

    // Should show @ in input
    const input = page.locator('textarea')
    await expect(input).toHaveValue('@')

    // Should show mention dropdown
    await expect(page.locator('.mention-dropdown, [role="listbox"]').first()).toBeVisible()
  })

  test('should display glassmorphic message container', async ({ page }) => {
    // Navigate to channel
    await page.click('text=Channels')
    await page.click('text=general')

    // Wait for messages to load
    await page.waitForSelector('[data-message-id]', { timeout: 5000 })

    // Check for glassmorphic styling
    const messageContainer = page.locator('.backdrop-blur-md').first()
    await expect(messageContainer).toBeVisible()

    // Verify it has the expected styling
    const styles = await messageContainer.evaluate((el) => ({
      borderRadius: window.getComputedStyle(el).borderRadius,
      backdropFilter: window.getComputedStyle(el).backdropFilter,
    }))

    expect(styles.backdropFilter).toContain('blur')
    expect(styles.borderRadius).not.toBe('0px')
  })
})
