import { PropsWithChildren } from 'react'
import { Pagination } from 'react-bootstrap'

const PaginationControls = ({
  onGoToFirstPage,
  onGoToPreviousPage,
  onGoToNextPage,
  onGoToLastPage,
  canPreviousPage,
  canNextPage,
  children,
}: PropsWithChildren<{
  onGoToFirstPage: () => void
  onGoToPreviousPage: () => void
  onGoToNextPage: () => void
  onGoToLastPage: () => void
  canPreviousPage: boolean
  canNextPage: boolean
  children: React.ReactNode
}>) => {
  return (
    <>
      <Pagination.First onClick={onGoToFirstPage} disabled={!canPreviousPage} />
      <Pagination.Prev
        onClick={onGoToPreviousPage}
        disabled={!canPreviousPage}
      />
      {children}
      <Pagination.Next onClick={onGoToNextPage} disabled={!canNextPage} />
      <Pagination.Last onClick={onGoToLastPage} disabled={!canNextPage} />
    </>
  )
}

export default PaginationControls
