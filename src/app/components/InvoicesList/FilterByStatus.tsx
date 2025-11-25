import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFilter, faXmark } from '@fortawesome/free-solid-svg-icons'

function FilterByStatus({ column }: { column: any }) {
  const { filterValue, setFilter } = column

  const handleFilterBy = () => {
    setFilter('No')
  }

  const handleFilterByFinished = () => {
    setFilter(undefined)
  }

  const handleFilterByUnfinished = () => {
    setFilter('Yes')
  }

  return (
    <>
      {filterValue === undefined ? (
        <FontAwesomeIcon icon={faFilter} onClick={handleFilterBy} size="xs" />
      ) : null}
      {filterValue === 'No' ? (
        <FontAwesomeIcon icon={faXmark} onClick={handleFilterByUnfinished} />
      ) : null}
      {filterValue === 'Yes' ? (
        <FontAwesomeIcon icon={faCheck} onClick={handleFilterByFinished} />
      ) : null}
    </>
  )
}

export default FilterByStatus
