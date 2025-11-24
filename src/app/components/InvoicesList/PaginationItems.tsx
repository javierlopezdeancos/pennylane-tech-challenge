import { Pagination } from 'react-bootstrap'

const PaginationItems = ({
  pageIndex,
  pageCount,
  gotoPage,
}: {
  pageIndex: number
  pageCount: number
  gotoPage: (page: number) => void
}): React.ReactElement => {
  const getPaginationItems = (
    currentPage: number,
    totalPages: number,
    onClick: (page: number) => void
  ) => {
    const items = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onClick(i)}
          >
            {i + 1}
          </Pagination.Item>
        )
      }
    } else {
      let startPage = Math.max(0, currentPage - 2)
      let endPage = Math.min(totalPages - 1, currentPage + 2)

      if (currentPage < 2) {
        endPage = maxPagesToShow - 1
      } else if (currentPage > totalPages - 3) {
        startPage = totalPages - maxPagesToShow
      }

      if (startPage > 0) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />)
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onClick(i)}
          >
            {i + 1}
          </Pagination.Item>
        )
      }

      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />)
      }
    }

    return items
  }

  return <>{getPaginationItems(pageIndex, pageCount, gotoPage)}</>
}

export default PaginationItems
