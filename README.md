# Pennylane frontend challenge

This repository contains the guidelines for the frontend interview question, as well as a repository skeleton with which to start.

## Your mission

> ***Implement an invoice editor with React***

### Objectives

The goal is to leverage an existing REST HTTP API to build the prototype of an invoicing editor.

This prototype allows users to perform simple actions around their invoices:

- List existing invoices with relevant details
- Create new invoices
- Manage existing invoices
  - Finalize invoices
  - Delete invoices

We do not expect the prototype to be UI-rich as we'll mainly focus on code quality & user experience. We expect you to adopt standard coding practices & setup, including testing, as if you were working on a real application with other coworkers.

Feel free to use pre-installed dependencies or add new ones if you have a legitimate use of them.

Please take the time to identify advanced features that could be useful for an invoice editor & write down tech improvements/ideas you could work on.

For each feature/tech improvement, we want to understand:

- What led you to think about this
- Why it would be useful
- A potential prototype implementation (feel free to work around API limitations)
- What might be missing for you to implement it (API limitations, technical constraints)

### Deliverable

- The codebase should be pushed on the current GitHub private repository;
- Deploy the application using any PaaS like Vercel, Netlify, Heroku, Cloudflare Pages, personal server, etc;
- Submit links to the above [via this form](https://forms.gle/siH7Rezuq2V1mUJGA).

## What you're working with

### Data model

The REST API contains 4 resources: customers, products, invoices & invoice lines.

Side notes:

- Invoices contain multiple invoice lines.
- Invoice lines are accessed via their invoice. To update them, use the relevant invoice API endpoints.
- Once the `finalized` field is set to `true` for invoices, no field may be modified except for `paid`.

The REST API base URL is `https://jean-test-api.herokuapp.com/`.
Each API request must include an HTTP header named `X-SESSION`. The value of this header should be the token provided in the current repository description.

An OpenAPI definition for this REST API is available [here](https://jean-test-api.herokuapp.com/api-docs/index.html).

The invoices list endpoint supports a `filter` query param which can be used as described in [our external API documentation](https://pennylane.readme.io/docs/setting-up-filters).

### API client

An API client based on `openapi-client-axios` is available through a React Context set up in `src/app/index.tsx`. The context can be consumed using the `useApi` hook. Before using it, please add the API token (available in the repo description in the "About" section) in `/src/app/index.tsx`. If you do not have one, please contact us.

|<img width="353" height="322" alt="image" src="https://github.com/user-attachments/assets/bfa0093b-999a-432f-b4ec-edbe85eae6bc" />|
|---|

```tsx
ReactDOM.render(
  <ApiProvider
    url="https://jean-test-api.herokuapp.com/"
    token="" // set your api token here, you can find the required token in the repository description.
  >
    <App />
  </ApiProvider>
);
```

```tsx
import { useEffect } from "react";
import { useApi } from "api";

const FooComponent = () => {
  const api = useApi();

  useEffect(() => {
    const fetch = async () => {
      const res = await api.getInvoices();
    }

    fetch();
  })

  return <div>bar</div>;
}
```

### Repository contents

This repository has been initialized with [create-react-app](https://github.com/facebook/create-react-app). It is to be used as a starting point for developing the prototype.

A set of packages has been included in [package.json](./package.json), please feel free to use them. Their usage is optional; you are not expected to learn any new libraries for this test.

As much as possible, please avoid introducing new dependencies - if you find this necessary, please explain why.

You'll find the `InvoicesList` component already started in the `components` folder.

If you prefer to use JavaScript without typing, you can execute the command `yarn eject_ts`

### Deployment of the app

As mentioned above, as a deliverable of the project, we expect you to deploy your application. Unfortunately, due to GitHub permissions, depending on the PaaS you choose, you might lack the appropriate permissions to install the necessary GitHub actions to do this automatically.

Therefore, we suggest you use the associated CLI of the PaaS or their drag-and-drop UI widget to easily deploy.

One potential free solution to deploy the app is to use Cloudflare Pages.

Prerequisite:

- **Have a personal Cloudflare account (this is free)**. If you don't have one, [you can easily sign up on the Cloudflare website.](https://dash.cloudflare.com/sign-up/workers-and-pages)

Steps to deploy the app:

1. **Run `yarn build`**: This command will compile your application.

2. **Install Wrangler (Cloudflare CLI) globally via npm using `npm install -g wrangler`**: Wrangler is a command-line tool that allows you to interact with Cloudflare services.

2. **Run `wrangler pages project create <my-react-app>` (replace <my-react-app> with the name of your app)**: This command creates a new project on Cloudflare Pages. It will open an OAuth page to authorize Cloudflare with your GitHub account. At the end, it will provide you with a stable link to access your app.

3. **Run `wrangler pages deploy build`**: This command triggers a new deployment of your app. You need to run it every time you want to deploy changes to your app.

4. **Run `wrangler pages project list`** if you don't remember the URL of your app: This will list all your Cloudflare projects and their corresponding URLs.

---

## Solution Implementation

[![Netlify Status](https://api.netlify.com/api/v1/badges/b2f0343a-9da4-43b1-8a21-fe2de0a59dce/deploy-status)](https://app.netlify.com/projects/pennylane-tech-challenge/deploys)

### Overview

This invoice editor prototype has been built following React best practices with a focus on user experience, code quality, and maintainability. The application provides a complete CRUD interface for invoice management with additional features for bulk operations and filtering.

### Implemented Features

#### 1. Invoices List (`/`)

- **Data Table with react-table**: Server-side paginated table displaying invoices with customer info, totals, status, and dates
- **Sortable Columns**: Total, Tax, Date, and Deadline columns support ascending/descending sorting
- **Filtering**: Filter invoices by Finalized and Paid status using dropdown filters in column headers
- **Pagination Controls**: Navigate between pages with first/previous/next/last buttons, page size selector, and direct page input
- **Row Selection**: Checkbox selection for individual rows and "select all" for the current page
- **Bulk Actions**: Finalize or delete multiple selected invoices simultaneously with confirmation modals
- **Quick Actions**: Each row has action buttons to view, edit, finalize, or delete individual invoices

#### 2. Create Invoice (`/create`)

- **Customer Autocomplete**: Async paginated search for customers using `react-select-async-paginate`
- **Product Autocomplete**: Same async paginated search for products in invoice lines
- **Dynamic Lines**: Add/remove invoice line items with product selection and quantity input
- **Form Validation**: Create button is disabled until customer and at least one valid line (product + quantity > 0) are provided
- **Invoice Properties**: Toggle checkboxes for Finalized and Paid status
- **Date Fields**: Invoice date (defaults to today) and deadline date pickers
- **Toast Notifications**: Success/error feedback after submission with auto-redirect to invoice detail

#### 3. Invoice Detail View (`/invoice/:id`)

- **Customer Information Card**: Displays customer name, address, city, country with country flag (using `react-country-flag`)
- **Invoice Information Card**: Shows invoice date, deadline, finalized status (Draft/Finalized badge), and payment status (Paid/Unpaid badge)
- **Invoice Items Table**: Lists all line items with product details, unit price, quantity, unit, VAT rate, tax, and line total
- **Summary Card**: Displays subtotal, tax, and grand total calculations
- **Action Buttons**: Finalize (disabled if already finalized) and Remove invoice buttons
- **Loading Skeleton**: Shows placeholder UI while fetching invoice data

#### 4. Edit Invoice (`/invoice/:id/edit`)

- **Pre-populated Form**: Loads existing invoice data including customer, dates, status, and lines
- **Line Management**:
  - Existing lines can be marked for deletion (soft delete with `_destroy` flag) and restored
  - New lines can be added and removed
  - Visual feedback for deleted lines (opacity + strikethrough)
- **Same Validation**: Requires customer and at least one active valid line
- **Update Flow**: Submits changes via PUT request with proper `invoice_lines_attributes` structure

#### 5. Reusable Components

- **InvoiceFinalize**: Modal component for confirming invoice finalization with loading states and toast feedback
- **InvoiceDelete**: Modal component for confirming invoice deletion with loading states and toast feedback
- **GoBack**: Navigation component with optional "back to root" behavior
- **PageLayout**: Wrapper with logo and consistent page structure
- **Loading Skeletons**: Placeholder UI components for list and detail views

### Technical Decisions

#### State Management

- **Local State with useState**: Chose local component state over global state management (Redux/Context) as the app has clear component boundaries and no complex cross-component state sharing needs
- **Server State**: Each page fetches its own data; no client-side caching to ensure fresh data

#### UI Framework

- **React Bootstrap**: Used for consistent, responsive UI components (Cards, Tables, Modals, Forms, Buttons, Toasts)
- **Custom Icons**: SVG icon components for action buttons (File, EditFile, SignFile, DeleteFile)

#### Data Fetching

- **openapi-client-axios**: Leveraged the provided API client for type-safe API calls
- **Async Paginate**: Used `react-select-async-paginate` for customer/product search with infinite scroll

#### Table Implementation

- **react-table v7**: Used with manual pagination, sorting, and filtering plugins
- **Server-side Pagination**: All pagination is handled server-side; client sends page/per_page params

#### Form Handling

- **Controlled Components**: All form inputs are fully controlled for predictable state
- **Validation Logic**: `canSubmit()` function checks all required fields before enabling submit buttons

#### Error Handling

- **Try/Catch with Toast Feedback**: All API calls wrapped with error handling and user-friendly toast messages
- **Console Logging**: Errors logged to console for debugging (with eslint-disable comments as required)

#### Routing

- **React Router v6**: Clean route structure with nested layouts
  - `/` - Invoices list
  - `/create` - Create new invoice
  - `/invoice/:id` - View invoice details
  - `/invoice/:id/edit` - Edit invoice

### Testing Strategy

#### E2E Tests with Playwright

Tests are organized by feature/route in separate spec files:

- `InvoicesList.spec.ts` - List loading, filtering, sorting, row selection, bulk actions
- `InvoiceCreate.spec.ts` - Form loading, validation, invoice creation, line management
- `InvoicesShow.spec.ts` - Detail display, action buttons, navigation
- `InvoicesEdit.spec.ts` - Form pre-population, editing, line delete/restore
- `InvoicesCrossRouteNavigation.spec.ts` - Navigation flows between routes

#### Test Fixtures

- **API Mocking**: Custom Playwright fixture (`api-mock.ts`) intercepts all API calls and returns mock data
- **Mock Data**: Centralized mock data (`mock-data.ts`) for consistent test scenarios

### Advanced Features & Ideas for Future Development

#### 1. Invoice PDF Export

- **Motivation**: Users need to share or print invoices
- **Implementation**: Use libraries like `@react-pdf/renderer` or `html2pdf.js` to generate downloadable PDFs
- **API Limitation**: Would need a PDF generation endpoint or client-side rendering

#### 2. Invoice Duplication

- **Motivation**: Creating similar invoices is a common workflow
- **Implementation**: "Duplicate" button that pre-fills the create form with existing invoice data
- **Requirements**: Copy all line items with ability to modify before saving

#### 3. Advanced Filtering

- **Motivation**: Finding invoices by date range, customer, amount, etc.
- **Implementation**: Filter panel with date pickers, customer autocomplete, amount range inputs
- **API Support**: The API supports filter query params as documented

#### 4. Dashboard with Analytics

- **Motivation**: Business insights on revenue, outstanding payments, overdue invoices
- **Implementation**: Summary cards, charts (using Chart.js or Recharts), and KPI metrics
- **Requirements**: Aggregation endpoints or client-side calculation from invoice data

#### 5. Email Invoice

- **Motivation**: Send invoices directly to customers
- **Implementation**: Email composition modal with customer email pre-filled, customizable message
- **API Limitation**: Would require email sending endpoint on the backend

#### 6. Invoice Templates

- **Motivation**: Consistent branding and format for different invoice types
- **Implementation**: Template selection in create/edit, stored templates with default products/settings
- **Requirements**: Template storage and management endpoints

#### 7. Recurring Invoices

- **Motivation**: Subscription-based billing automation
- **Implementation**: Schedule configuration (weekly/monthly/yearly), auto-generation logic
- **API Limitation**: Would need scheduling/cron job support on backend

#### 8. Multi-currency Support

- **Motivation**: International invoicing
- **Implementation**: Currency selector, exchange rate integration, currency formatting
- **Requirements**: Currency conversion API and currency field on invoice model

#### 9. Offline Support

- **Motivation**: Work without internet connection
- **Implementation**: Service Worker, IndexedDB for local storage, sync queue
- **Complexity**: Conflict resolution, optimistic updates, background sync

#### 10. Keyboard Shortcuts

- **Motivation**: Power user efficiency
- **Implementation**: Global shortcuts for common actions (Ctrl+N for new, Ctrl+S for save, etc.)
- **Library**: Could use `react-hotkeys-hook` for implementation
