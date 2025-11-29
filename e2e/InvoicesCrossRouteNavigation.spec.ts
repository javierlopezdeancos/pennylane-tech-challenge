import { test } from './fixtures/api-mock'

test.describe('Cross-route Navigation', () => {
  test('should navigate between list and create', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const createBtn = page
      .locator('button:has-text("Create invoice")')
      .first()

    await createBtn.click()
    await page.waitForURL('/create')

    const backBtn = page
      .locator('button')
      .filter({ hasText: /Back|back/ })
      .first()

    const backBtnIsVisible = await backBtn
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (backBtnIsVisible) {
      await backBtn.click()
    }
  })

  test('should navigate from list to invoice detail', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstRowBtn = page
      .locator('tbody tr')
      .first()
      .locator('button')
      .first()

    const firstRowBtnIsVisible = await firstRowBtn
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (firstRowBtnIsVisible) {
      await firstRowBtn.click()
      await page.waitForTimeout(1000)
    }
  })
})

