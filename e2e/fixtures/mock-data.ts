export const mockCustomers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    address: '123 Main St',
    zip_code: '12345',
    city: 'Springfield',
    country: 'USA',
    country_code: 'US',
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    address: '456 Oak Ave',
    zip_code: '67890',
    city: 'Metropolis',
    country: 'USA',
    country_code: 'US',
  },
]

export const mockProducts = [
  {
    id: 1,
    label: 'Tesla Model S',
    vat_rate: '20',
    unit: 'piece',
    unit_price: '80000.0',
    unit_price_without_tax: '66666.67',
    unit_tax: '13333.33',
  },
  {
    id: 2,
    label: 'Tesla Model 3',
    vat_rate: '20',
    unit: 'piece',
    unit_price: '50000.0',
    unit_price_without_tax: '41666.67',
    unit_tax: '8333.33',
  },
  {
    id: 3,
    label: 'Tesla Model X',
    vat_rate: '20',
    unit: 'piece',
    unit_price: '90000.0',
    unit_price_without_tax: '75000.0',
    unit_tax: '15000.0',
  },
]

export const mockInvoices = [
  {
    id: 100,
    customer_id: 1,
    finalized: false,
    paid: false,
    date: '2025-01-01',
    deadline: '2025-02-01',
    total: '80000.0',
    tax: '13333.33',
    invoice_lines: [
      {
        id: 1001,
        invoice_id: 100,
        product_id: 1,
        quantity: 1,
        unit: 'piece',
        label: 'Tesla Model S',
        vat_rate: '20',
        price: '80000.0',
        tax: '13333.33',
        product: mockProducts[0],
      },
    ],
    customer: mockCustomers[0],
  },
  {
    id: 101,
    customer_id: 2,
    finalized: true,
    paid: true,
    date: '2024-12-01',
    deadline: '2025-01-01',
    total: '100000.0',
    tax: '16666.67',
    invoice_lines: [
      {
        id: 1002,
        invoice_id: 101,
        product_id: 2,
        quantity: 2,
        unit: 'piece',
        label: 'Tesla Model 3',
        vat_rate: '20',
        price: '100000.0',
        tax: '16666.67',
        product: mockProducts[1],
      },
    ],
    customer: mockCustomers[1],
  },
]

export const getInvoicesListResponse = (page = 1, per_page = 10) => ({
  pagination: {
    page,
    total_pages: 1,
    total_entries: mockInvoices.length,
    per_page,
  },
  invoices: mockInvoices.slice((page - 1) * per_page, page * per_page),
})

export const getSearchCustomersResponse = (
  query = '',
  page = 1,
  per_page = 10
) => {
  const filtered = mockCustomers.filter(
    (c) =>
      c.first_name.toLowerCase().includes(query.toLowerCase()) ||
      c.last_name.toLowerCase().includes(query.toLowerCase())
  )
  return {
    pagination: {
      page,
      total_pages: Math.ceil(filtered.length / per_page),
      total_entries: filtered.length,
      per_page,
    },
    customers: filtered.slice((page - 1) * per_page, page * per_page),
  }
}

export const getSearchProductsResponse = (
  query = '',
  page = 1,
  per_page = 10
) => {
  const filtered = mockProducts.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  )
  return {
    pagination: {
      page,
      total_pages: Math.ceil(filtered.length / per_page),
      total_entries: filtered.length,
      per_page,
    },
    products: filtered.slice((page - 1) * per_page, page * per_page),
  }
}
