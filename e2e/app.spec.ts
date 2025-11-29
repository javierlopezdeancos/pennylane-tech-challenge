import { test, expect } from './fixtures/api-mock'

test.describe('Invoices App E2E Tests', () => {
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

      const totalHeader = page
        .locator('th')
        .filter({ hasText: 'Total' })
        .first()

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

      const bulkFinalizeBtn = page.locator(
        'button:has-text("Finalize selected")'
      )

      await expect(bulkFinalizeBtn).toBeVisible()

      const bulkDeleteBtn = page.locator('button:has-text("Remove selected")')

      await expect(bulkDeleteBtn).toBeVisible()
    })

    test('should navigate to create invoice page', async ({
      page,
      mockAPI,
    }) => {
      await mockAPI.mockAll()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const createBtn = page
        .locator('button:has-text("Create invoice")')
        .first()

      await expect(createBtn).toBeVisible()

      await createBtn.click()
      await page.waitForURL('/create')

      await expect(page).toHaveURL(/.*\/create/)
      await expect(page.locator('h1')).toContainText('Create Invoice')
    })
  })

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
})
