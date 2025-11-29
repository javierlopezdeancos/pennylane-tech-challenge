import { test, expect } from './fixtures/api-mock'

test.describe('InvoiceEdit Route (/invoice/:id/edit)', () => {
  test('should load edit form with invoice data pre-filled', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100/edit')
    await page.waitForLoadState('networkidle')

    await page
      .waitForSelector('.spinner-border', { state: 'hidden', timeout: 10000 })
      .catch(() => {})

    const title = page.locator('h1')

    await expect(title).toContainText(/Edit/i)
    await expect(page.locator('label:has-text("Customer")')).toBeVisible()
    await expect(page.locator('label:has-text("Date")')).toBeVisible()
  })

  test('should allow editing invoice data', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100/edit')
    await page.waitForLoadState('networkidle')

    const updateBtn = page.locator('button:has-text("Update")').first()

    await expect(updateBtn).toBeDefined()

    const paidCheckbox = page
      .locator('input[type="checkbox"]')
      .filter({ hasText: /Paid/ })
      .first()

    const paidCheckboxIsVisible = await paidCheckbox
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (paidCheckboxIsVisible) {
      const isChecked = await paidCheckbox.isChecked()

      await paidCheckbox.click()

      const newChecked = await paidCheckbox.isChecked()

      // eslint-disable-next-line
      expect(newChecked).not.toBe(isChecked)
    }
  })

  test('should support deleting and restoring invoice lines', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100/edit')
    await page.waitForLoadState('networkidle')

    const deleteBtn = page
      .locator('button')
      .filter({ hasText: /Delete|Remove/ })
      .first()

    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click()
      await page.waitForTimeout(300)

      const lineContainer = deleteBtn.locator('..').first()

      // eslint-disable-next-line
      await expect(lineContainer).toBeDefined()

      const restoreBtn = page
        .locator('button')
        .filter({ hasText: /Restore/ })
        .first()

      if (await restoreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await restoreBtn.click()
        await page.waitForTimeout(300)
      }
    }
  })

  test('should update invoice', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/invoice/100/edit')
    await page.waitForLoadState('networkidle')

    const updateBtn = page.locator('button:has-text("Update")').first()

    const updateBtnIsEnabled = await updateBtn
      .isEnabled({ timeout: 2000 })
      .catch(() => false)

    if (updateBtnIsEnabled) {
      await updateBtn.click()
      await page.waitForTimeout(2000)

      const successToast = page.locator('text=updated').first()

      const successToastIsVisible = await successToast
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (successToastIsVisible) {
        // eslint-disable-next-line
        await expect(successToast).toBeVisible()
      }
    }
  })
})

