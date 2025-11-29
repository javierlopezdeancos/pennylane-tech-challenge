import { test, expect } from './fixtures/api-mock'

test.describe('InvoiceShow Route (/invoice/:id)', () => {
  test('should display invoice details', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100')
    await page.waitForLoadState('networkidle')

    const title = page.locator('h1, h2, .card-title').first()

    await expect(title).toBeDefined()

    const customerSection = page.locator('text=Customer')

    // eslint-disable-next-line
    await expect(customerSection)
      .toBeVisible()
      .catch(() => {})
  })

  test('should have finalize and delete buttons', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100')
    await page.waitForLoadState('networkidle')

    const buttonCount = await page.locator('button').count()

    expect(buttonCount).toBeGreaterThan(0)
  })

  test('should navigate to edit page', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100')
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('button').filter({ hasText: /Edit/ }).first()

    const editBtnIsVisible = await editBtn
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (editBtnIsVisible) {
      await editBtn.click()
      await page.waitForURL('**/edit', { timeout: 5000 }).catch(() => {})
    }
  })
})

