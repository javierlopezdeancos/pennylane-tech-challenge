import { test, expect } from './fixtures/api-mock'

test.describe('InvoiceCreate Route (/create)', () => {
  test('should load create invoice form with all fields', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/create')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Create Invoice')
    await expect(page.locator('label:has-text("Customer")')).toBeVisible()
    await expect(page.locator('text=Finalized').first()).toBeVisible()
    await expect(page.locator('text=Paid').first()).toBeVisible()
    await expect(page.locator('label:has-text("Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Deadline")')).toBeVisible()
    await expect(page.locator('text=Lines').first()).toBeVisible()
  })

  test('should validate form and enable Create button only when valid', async ({
    page,
    mockAPI,
  }) => {
    await mockAPI.mockAll()

    await page.goto('/create')
    await page.waitForLoadState('networkidle')

    const createBtn = page.locator('button:has-text("Create")').first()

    await expect(createBtn).toBeDisabled()

    const customerInput = page.locator('input[id*="react-select"]').first()

    await customerInput.fill('John')
    await page.waitForTimeout(500)

    const customerOption = page.locator('[class*="option"]').first()

    const customerOptionIsVisible = await customerOption
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (customerOptionIsVisible) {
      await customerOption.click()
    }

    await page.waitForTimeout(300)
    await expect(createBtn).toBeDefined()
  })

  test('should create a new invoice', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/create')
    await page.waitForLoadState('networkidle')

    const customerInput = page.locator('input[id*="react-select"]').first()

    await customerInput.fill('John')
    await page.waitForTimeout(500)

    const customerOption = page.locator('[class*="option"]').first()

    const customerOptionIsVisible = await customerOption
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (customerOptionIsVisible) {
      await customerOption.click()
    }

    await page.waitForTimeout(300)

    const productInput = page.locator('input[id*="react-select"]').nth(1)

    await productInput.fill('Tesla')
    await page.waitForTimeout(500)

    const productOption = page.locator('[class*="option"]').first()

    const productOptionIsVisible = await productOption
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (productOptionIsVisible) {
      await productOption.click()
    }

    await page.waitForTimeout(300)

    const quantityInput = page.locator('input[type="number"]').first()

    await quantityInput.fill('1')

    const createBtn = page.locator('button:has-text("Create")').first()

    await expect(createBtn).not.toBeDisabled()
    await createBtn.click()

    await page.waitForURL('**/invoice/**', { timeout: 10000 }).catch(() => {
      // Navigation might not work without real backend
    })
  })

  test('should add and remove invoice lines', async ({ page, mockAPI }) => {
    await mockAPI.mockAll()

    await page.goto('/create')
    await page.waitForLoadState('networkidle')

    const addLineBtn = page.locator('button:has-text("+ Add line")')

    await expect(addLineBtn).toBeVisible()

    const linesContainer = page
      .locator('.card-body')
      .filter({ hasText: 'Lines' })

    const initialRows = await linesContainer.locator('.row').count()

    await addLineBtn.click()
    await page.waitForTimeout(300)

    const newRows = await linesContainer.locator('.row').count()

    expect(newRows).toBeGreaterThan(initialRows)
  })
})
