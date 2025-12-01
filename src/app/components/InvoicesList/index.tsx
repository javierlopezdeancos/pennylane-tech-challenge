import { useApi } from 'api'
import { Invoice } from 'types'
import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  useTable,
  usePagination,
  useFilters,
  useSortBy,
  Column,
  CellProps,
} from 'react-table'
import {
  Table,
  Pagination,
  Form,
  InputGroup,
  Button,
  OverlayTrigger,
  Popover,
  ListGroup,
} from 'react-bootstrap'
import { Modal, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import PaginationItems from './PaginationItems'
import PaginationControls from './PaginationControls'
import InvoiceListSkeleton from './InvoiceListSkeleton'
import FilterByStatus from './FilterByStatus'
import SortableHeader from './SortableHeader'
import { useNavigate } from 'react-router'
import InvoiceFinalize from '../InvoiceFinalize'
import InvoiceDelete from '../InvoiceDelete'
import InvoicePay from '../InvoicePay'

const InvoicesList = (): React.ReactElement => {
  const api = useApi()
  const navigate = useNavigate()

  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [loading, setLoading] = useState(false)

  const [pageCount, setPageCount] = useState(0)

  const [totalEntries, setTotalEntries] = useState(0)

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>()

  const [showFinalizeModal, setShowFinalizeModal] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [showPayModal, setShowPayModal] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  const [bulkAction, setBulkAction] = useState<'finalize' | 'paid' | null>(null)

  const [bulkLoading, setBulkLoading] = useState(false)

  const [bulkToast, setBulkToast] = useState<{
    show: boolean
    msg: string
    success: boolean
  }>({ show: false, msg: '', success: true })

  const handleGoToInvoiceDetails = useCallback(
    (id: number) => {
      navigate(`/invoice/${id}`)
    },
    [navigate]
  )

  const handleGoToEditInvoice = useCallback(
    (id: number) => {
      navigate(`/invoice/${id}/edit`)
    },
    [navigate]
  )

  const handleFinalizeInvoice = useCallback(
    (invoiceId: number) => {
      setSelectedInvoiceId(invoiceId)
      setShowFinalizeModal(true)
    },
    [setSelectedInvoiceId, setShowFinalizeModal]
  )

  const handlePayInvoice = useCallback(
    (invoiceId: number) => {
      setSelectedInvoiceId(invoiceId)
      setShowPayModal(true)
    },
    [setSelectedInvoiceId, setShowPayModal]
  )

  const columns: Array<Column<Invoice>> = useMemo(
    () => [
      {
        Header: 'Id',
        disableSortBy: true,
        accessor: 'id',
        enableResizing: false,
      },
      {
        Header: 'Customer',
        disableSortBy: true,
        accessor: (d) =>
          d.customer ? `${d.customer.first_name} ${d.customer.last_name}` : '',
      },
      {
        Header: 'Address',
        disableSortBy: true,
        accessor: (d) =>
          d.customer
            ? `${d.customer.address}, ${d.customer.zip_code} ${d.customer.city}`
            : '',
      },
      {
        Header: 'Total',
        accessor: 'total',
        disableSortBy: false,
        Cell: ({ value }: CellProps<Invoice, string | null>) => (
          <>{value || '-'}</>
        ),
      },
      {
        Header: 'Tax',
        accessor: 'tax',
        disableSortBy: false,
        Cell: ({ value }: CellProps<Invoice, string | null>) => (
          <>{value || '-'}</>
        ),
      },
      {
        Header: 'Finalized',
        accessor: (d) => (d.finalized ? 'Yes' : 'No'),
        disableSortBy: true,
        enableResizing: false,
        Filter: FilterByStatus,
        filter: 'equals',
      },
      {
        Header: 'Paid',
        accessor: (d) => (d.paid ? 'Yes' : 'No'),
        disableSortBy: true,
        Filter: FilterByStatus,
        filter: 'equals',
      },
      {
        Header: 'Date',
        accessor: 'date',
        disableSortBy: false,
        Cell: ({ value }: CellProps<Invoice, string | null>) => (
          <>{value || ''}</>
        ),
      },
      {
        Header: 'Deadline',
        accessor: 'deadline',
        disableSortBy: false,
        Cell: ({ value }: CellProps<Invoice, string | null>) => (
          <>{value || ''}</>
        ),
      },
      {
        Header: '',
        id: 'actions',
        disableSortBy: true,
        Cell: ({ row }: { row: { original: Invoice } }) => (
          <OverlayTrigger
            trigger="click"
            placement="left"
            rootClose
            overlay={
              <Popover id={`popover-actions-${row.original.id}`}>
                <Popover.Body className="p-0">
                  <ListGroup variant="flush">
                    <ListGroup.Item
                      action
                      onClick={() => handleGoToInvoiceDetails(row.original.id)}
                    >
                      View details
                    </ListGroup.Item>
                    <ListGroup.Item
                      action
                      onClick={() => handleGoToEditInvoice(row.original.id)}
                    >
                      Edit
                    </ListGroup.Item>
                    <ListGroup.Item
                      action
                      onClick={() => handlePayInvoice(row.original.id)}
                    >
                      Pay
                    </ListGroup.Item>
                    <ListGroup.Item
                      action
                      onClick={() => handleFinalizeInvoice(row.original.id)}
                    >
                      Finalize
                    </ListGroup.Item>
                  </ListGroup>
                </Popover.Body>
              </Popover>
            }
          >
            <Button
              variant="link"
              className="p-0 text-dark border-0 shadow-none"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </Button>
          </OverlayTrigger>
        ),
      },
    ],
    [
      handleGoToInvoiceDetails,
      handleGoToEditInvoice,
      handleFinalizeInvoice,
      handlePayInvoice,
    ]
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable<Invoice>(
    {
      columns,
      data: invoices,
      initialState: { pageIndex: 0, pageSize: 10 },
      manualPagination: true,
      pageCount: pageCount,
      autoResetPage: false,
    },
    useFilters,
    useSortBy,
    usePagination
  )

  useEffect(() => {
    if (selectedInvoiceId) {
      return
    }

    const fetchInvoices = async () => {
      setLoading(true)

      const { data } = await api.getInvoices({
        page: pageIndex + 1,
        per_page: pageSize,
        filter: JSON.stringify([
          { field: 'paid', operator: 'eq', value: false },
        ]),
        sort: '+date',
      })

      setInvoices(data.invoices)
      setPageCount(data.pagination.total_pages)
      setTotalEntries(data.pagination.total_entries)
      setLoading(false)
    }

    fetchInvoices()
  }, [api, pageIndex, pageSize, selectedInvoiceId])

  const handleGoToFirstPage = () => {
    gotoPage(0)
  }

  const handleGoToPreviousPage = () => {
    previousPage()
  }

  const handleGoToNextPage = () => {
    nextPage()
  }

  const handleGoToLastPage = () => {
    gotoPage(pageCount - 1)
  }

  const pageSizeOptions = useMemo(() => {
    const defaultSizes = [10, 20, 30, 40, 50]

    if (totalEntries === 0) {
      return defaultSizes
    }

    const options = defaultSizes.filter((size) => size < totalEntries)

    options.push(totalEntries)

    return options
      .sort((a, b) => a - b)
      .filter((value, index, self) => index === 0 || value !== self[index - 1])
  }, [totalEntries])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  const isAllPageSelected = () => {
    if (!page || page.length === 0) {
      return false
    }

    return page.every((r) => selectedIds.has((r.original as Invoice).id))
  }

  const toggleSelectAllPage = () => {
    if (!page) {
      return
    }

    const allSelected = isAllPageSelected()

    setSelectedIds((prev) => {
      const next = new Set(prev)

      page.forEach((r) => {
        const id = (r.original as Invoice).id

        if (allSelected) {
          next.delete(id)
        } else {
          next.add(id)
        }
      })
      return next
    })
  }

  const selectedCount = selectedIds.size

  const handleOpenBulk = (action: 'finalize' | 'paid') => {
    setBulkAction(action)
    setShowBulkConfirm(true)
  }

  const handleConfirmBulk = async () => {
    if (!bulkAction) {
      return
    }

    const ids = Array.from(selectedIds)

    if (ids.length === 0) {
      return
    }

    setBulkLoading(true)

    try {
      if (bulkAction === 'finalize') {
        const results = await Promise.allSettled(
          ids.map((id) =>
            api.putInvoice({ id }, { invoice: { id, finalized: true } })
          )
        )

        const successes: Invoice[] = []
        const failures: any[] = []

        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            successes.push(r.value.data)
          } else {
            failures.push({ id: ids[idx], reason: r })
          }
        })

        if (successes.length) {
          setInvoices((prev) =>
            prev.map((inv) => {
              const updated = successes.find((s) => s.id === inv.id)
              return updated || inv
            })
          )
        }

        setBulkToast({
          show: true,
          msg: `Finalized ${successes.length} invoices, ${failures.length} failed.`,
          success: failures.length === 0,
        })

        setSelectedIds((prev) => {
          const next = new Set(prev)
          successes.forEach((s) => next.delete(s.id))
          return next
        })
      } else if (bulkAction === 'paid') {
        const results = await Promise.allSettled(
          ids.map((id) =>
            api.putInvoice({ id }, { invoice: { id, paid: true } })
          )
        )

        const successes: Invoice[] = []
        const failures: any[] = []

        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            successes.push(r.value.data)
          } else {
            failures.push({ id: ids[idx], reason: r })
          }
        })

        if (successes.length) {
          setInvoices((prev) =>
            prev.filter((inv) => !successes.find((s) => s.id === inv.id))
          )
        }

        setBulkToast({
          show: true,
          msg: `Marked ${successes.length} invoices as paid, ${failures.length} failed.`,
          success: failures.length === 0,
        })

        setSelectedIds((prev) => {
          const next = new Set(prev)
          successes.forEach((s) => next.delete(s.id))
          return next
        })
      }
    } catch (err: any) {
      console.error(err)

      setBulkToast({ show: true, msg: 'Bulk action failed', success: false })
    } finally {
      setBulkLoading(false)
      setShowBulkConfirm(false)
      setBulkAction(null)
    }
  }

  const handleFinalizeSuccess = (updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    )

    setShowFinalizeModal(false)
    setSelectedInvoiceId(undefined)
  }

  const handleFinalizeFailure = (error: unknown) => {
    console.error('Failed to finalize invoice:', error)

    setShowFinalizeModal(false)
    setSelectedInvoiceId(undefined)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setSelectedInvoiceId(undefined)
  }

  const handleDeleteFailure = (error: unknown) => {
    console.error('Failed to delete invoice:', error)

    setShowDeleteModal(false)
    setSelectedInvoiceId(undefined)
  }

  const handlePaySuccess = (paidInvoice: Invoice) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== paidInvoice.id))

    setShowPayModal(false)
    setSelectedInvoiceId(undefined)
  }

  const handlePayFailure = (error: unknown) => {
    console.error('Failed to pay invoice:', error)

    setShowPayModal(false)
    setSelectedInvoiceId(undefined)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2 w-100">
        <p className="text-start fs-5">{selectedCount} invoices selected.</p>
        <div className="d-flex justify-content-end align-items-center mb-2">
          <Button
            variant="success"
            className="me-2"
            onClick={() => handleOpenBulk('finalize')}
            disabled={selectedCount === 0 || bulkLoading || loading}
          >
            {bulkLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : null}
            Finalize selected
          </Button>
          <Button
            variant="success"
            onClick={() => handleOpenBulk('paid')}
            disabled={selectedCount === 0 || bulkLoading || loading}
          >
            {bulkLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : null}
            Paid selected
          </Button>

          <Button
            variant="primary"
            className="ms-2"
            onClick={() => navigate('/create')}
          >
            Create invoice
          </Button>
        </div>
      </div>
      <Table
        {...getTableProps()}
        className={`table ${loading ? '' : 'table-bordered table-striped'}`}
      >
        <thead>
          {headerGroups.map((headerGroup, hgIndex) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th style={{ verticalAlign: 'middle', padding: '8px' }}>
                <Form.Check
                  type="checkbox"
                  aria-label="Select all"
                  checked={isAllPageSelected()}
                  onChange={() => toggleSelectAllPage()}
                />
              </th>
              {headerGroup.headers.map((column) => {
                const sortProps = (column as any).getSortByToggleProps
                  ? (column as any).getSortByToggleProps()
                  : {}

                return (
                  <th
                    {...column.getHeaderProps(sortProps)}
                    style={{
                      cursor: (column as any).canSort ? 'pointer' : 'default',
                      verticalAlign: 'middle',
                      padding: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          cursor: (column as any).canSort
                            ? 'pointer'
                            : 'default',
                        }}
                      >
                        <SortableHeader column={column} />
                      </div>
                      <div
                        style={{
                          cursor: (column as any).canFilter
                            ? 'pointer'
                            : 'default',
                        }}
                      >
                        {(column as any).canFilter
                          ? (column as any).Filter
                            ? (column as any).Filter({ column })
                            : null
                          : null}
                      </div>
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {loading ? (
            <InvoiceListSkeleton rows={pageSize} columns={columns.length + 1} />
          ) : (
            page.map((row) => {
              prepareRow(row)

              const invoice = row.original as Invoice
              const checked = selectedIds.has(invoice.id)

              return (
                <tr {...row.getRowProps()}>
                  <td style={{ verticalAlign: 'middle', padding: '8px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(invoice.id)}
                      aria-label={`Select invoice ${invoice.id}`}
                    />
                  </td>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Form.Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
            }}
            style={{ width: '120px' }}
            className="me-2"
          >
            {pageSizeOptions.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Form.Select>
          <InputGroup style={{ width: '200px' }}>
            <InputGroup.Text>Go to page:</InputGroup.Text>
            <Form.Control
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
            />
          </InputGroup>
        </div>
        <Pagination>
          <PaginationControls
            onGoToFirstPage={handleGoToFirstPage}
            onGoToPreviousPage={handleGoToPreviousPage}
            onGoToNextPage={handleGoToNextPage}
            onGoToLastPage={handleGoToLastPage}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
          >
            <PaginationItems
              pageIndex={pageIndex}
              pageCount={pageCount}
              gotoPage={gotoPage}
            />
          </PaginationControls>
        </Pagination>
      </div>
      <InvoiceFinalize
        invoiceId={selectedInvoiceId}
        open={showFinalizeModal}
        onSuccess={handleFinalizeSuccess}
        onFailure={handleFinalizeFailure}
      />
      <InvoiceDelete
        invoiceId={selectedInvoiceId}
        open={showDeleteModal}
        onSuccess={handleDeleteSuccess}
        onFailure={handleDeleteFailure}
      />
      <InvoicePay
        invoiceId={selectedInvoiceId}
        open={showPayModal}
        onSuccess={handlePaySuccess}
        onFailure={handlePayFailure}
      />
      <Modal
        show={showBulkConfirm}
        onHide={() => setShowBulkConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm Bulk {bulkAction === 'paid' ? 'Mark as Paid' : 'Finalize'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to{' '}
          {bulkAction === 'paid' ? 'mark as paid' : 'finalize'} the selected{' '}
          {selectedCount} invoices?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowBulkConfirm(false)}
            disabled={bulkLoading}
          >
            Cancel
          </Button>
          <Button
            variant={'primary'}
            onClick={handleConfirmBulk}
            disabled={bulkLoading}
          >
            {bulkLoading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="bottom-end">
        <Toast
          show={bulkToast.show}
          onClose={() => setBulkToast((s) => ({ ...s, show: false }))}
          bg={bulkToast.success ? 'success' : 'danger'}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              {bulkToast.success ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={bulkToast.success ? '' : 'text-white'}>
            {bulkToast.msg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default InvoicesList
