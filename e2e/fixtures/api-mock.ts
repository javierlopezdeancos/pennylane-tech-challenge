import { test as base } from '@playwright/test'
import * as mockData from './mock-data'

export type MockAPI = {
  mockAll: () => Promise<void>
}

export const test = base.extend<{ mockAPI: MockAPI }>({
  mockAPI: async ({ page }, use) => {
    const mockAPI: MockAPI = {
      mockAll: async () => {
        await page.route('**/jean-test-api.herokuapp.com/**', async (route) => {
          const url = route.request().url()
          const method = route.request().method()

          const invoiceIdMatch = url.match(/\/invoices\/(\d+)/)
          if (invoiceIdMatch) {
            const id = parseInt(invoiceIdMatch[1])

            if (method === 'GET') {
              const invoice = mockData.mockInvoices.find((i) => i.id === id)
              if (invoice) {
                return route.fulfill({
                  status: 200,
                  contentType: 'application/json',
                  body: JSON.stringify(invoice),
                })
              } else {
                return route.fulfill({
                  status: 404,
                  contentType: 'application/json',
                  body: JSON.stringify({ message: 'Invoice not found' }),
                })
              }
            } else if (method === 'PUT') {
              const postData = route.request().postData() || '{}'
              const updated = {
                id,
                ...JSON.parse(postData).invoice,
              }
              return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(updated),
              })
            } else if (method === 'DELETE') {
              return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
              })
            }
          }

          if (url.includes('/invoices') && !url.match(/\/invoices\/\d+/)) {
            if (method === 'GET') {
              const params = new URL(url).searchParams
              const pageNum = parseInt(params.get('page') || '1')
              const perPage = parseInt(params.get('per_page') || '10')

              return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(
                  mockData.getInvoicesListResponse(pageNum, perPage)
                ),
              })
            } else if (method === 'POST') {
              const postData = route.request().postData() || '{}'
              const newInvoice = {
                id: 999,
                ...JSON.parse(postData).invoice,
              }
              return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(newInvoice),
              })
            }
          }

          if (url.includes('/customers/search')) {
            const params = new URL(url).searchParams
            const query = params.get('query') || ''
            const pageNum = parseInt(params.get('page') || '1')
            const perPage = parseInt(params.get('per_page') || '10')

            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(
                mockData.getSearchCustomersResponse(query, pageNum, perPage)
              ),
            })
          }

          if (url.includes('/products/search')) {
            const params = new URL(url).searchParams
            const query = params.get('query') || ''
            const pageNum = parseInt(params.get('page') || '1')
            const perPage = parseInt(params.get('per_page') || '10')

            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(
                mockData.getSearchProductsResponse(query, pageNum, perPage)
              ),
            })
          }

          // For any other requests, continue to network
          return route.continue()
        })
      },
    }

    await use(mockAPI)
  },
})

export { expect } from '@playwright/test'
