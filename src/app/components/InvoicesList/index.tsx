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
  Stack,
  Button,
} from 'react-bootstrap'
import PaginationItems from './PaginationItems'
import PaginationControls from './PaginationControls'
import InvoiceListSkeleton from './InvoiceListSkeleton'
import FilterByStatus from './FilterByStatus'
import SortableHeader from './SortableHeader'
import { useNavigate } from 'react-router'
import SignFile from 'app/icons/SignFile'
import DeleteFile from 'app/icons/DeleteFile'
import File from 'app/icons/File'

const InvoicesList = (): React.ReactElement => {
  const api = useApi()
  const navigate = useNavigate()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)

  const handleGoToInvoiceDetails = useCallback(
    (id: number) => {
      navigate(`/invoice/${id}`)
    },
    [navigate]
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
        Header: 'Actions',
        disableSortBy: false,
        Cell: ({ row }: { row: { original: Invoice } }) => (
          <Stack direction="horizontal" gap={1}>
            <Button
              variant="link"
              className="m-0 p-0"
              onClick={() => handleGoToInvoiceDetails(row.original.id)}
            >
              <File />
            </Button>
            <Button
              variant="link"
              className="m-0 p-0"
              onClick={() => handleGoToInvoiceDetails(row.original.id)}
            >
              <SignFile />
            </Button>
            <Button
              variant="link"
              className="m-0 p-0"
              onClick={() => handleGoToInvoiceDetails(row.original.id)}
            >
              <DeleteFile />
            </Button>
          </Stack>
        ),
      },
    ],
    [handleGoToInvoiceDetails]
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
    const fetchInvoices = async () => {
      setLoading(true)

      const { data } = await api.getInvoices({
        page: pageIndex + 1,
        per_page: pageSize,
      })

      setInvoices(data.invoices)
      setPageCount(data.pagination.total_pages)
      setTotalEntries(data.pagination.total_entries)
      setLoading(false)
    }
    fetchInvoices()
  }, [api, pageIndex, pageSize])

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

  return (
    <>
      <Table
        {...getTableProps()}
        className={`table ${loading ? '' : 'table-bordered table-striped'}`}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
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
            <InvoiceListSkeleton rows={pageSize} columns={columns.length} />
          ) : (
            page.map((row) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
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
    </>
  )
}

export default InvoicesList
