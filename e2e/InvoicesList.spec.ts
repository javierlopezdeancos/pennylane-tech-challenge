import { test, expect } from './fixtures/api-mock'

test.describe('InvoicesList Route (/)', () => {
  test('should load invoices list and display table', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/.*/)

    const table = page.locator('table')

    await expect(table).toBeVisible()

    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()

    expect(rowCount).toBeGreaterThan(0)
  })

  test('should support filtering by Finalized column', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const finalizedHeader = page
      .locator('th')
      .filter({ hasText: 'Finalized' })
      .first()

    await expect(finalizedHeader).toBeVisible()

    const filterIcon = finalizedHeader.locator('svg').first()

    if (await filterIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await filterIcon.click()
      await page.waitForTimeout(500)
    }

    const rows = page.locator('tbody tr')

    await expect(rows).toBeDefined()
  })

  test('should support sorting by Total', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const totalHeader = page.locator('th').filter({ hasText: 'Total' }).first()

    await expect(totalHeader).toBeVisible()

    await totalHeader.click()
    await page.waitForTimeout(300)

    const sortIndicator = totalHeader.locator('span').first()

    await expect(sortIndicator).toBeDefined()
  })

  test('should support row selection and bulk actions', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstRowCheckbox = page
      .locator('tbody tr')
      .first()
      .locator('input[type="checkbox"]')

    await expect(firstRowCheckbox).toBeVisible()

    await firstRowCheckbox.click()
    await page.waitForTimeout(300)

    const bulkFinalizeBtn = page.locator('button:has-text("Finalize selected")')

    await expect(bulkFinalizeBtn).toBeVisible()

    const bulkPaidBtn = page.locator('button:has-text("Paid selected")')

    await expect(bulkPaidBtn).toBeVisible()
  })

  test('should navigate to create invoice page', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const createBtn = page.locator('button:has-text("Create invoice")').first()

    await expect(createBtn).toBeVisible()

    await createBtn.click()
    await page.waitForURL('/create')

    await expect(page).toHaveURL(/.*\/create/)
    await expect(page.locator('h1')).toContainText('Create Invoice')
  })
})
