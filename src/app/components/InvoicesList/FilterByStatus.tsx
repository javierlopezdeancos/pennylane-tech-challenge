import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faFilter,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Stack } from 'react-bootstrap'

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
    <Stack direction="horizontal" gap={2} style={{ cursor: 'pointer' }}>
      {filterValue === undefined ? (
        <FontAwesomeIcon icon={faFilter} onClick={handleFilterBy} size="xs" />
      ) : null}
      {filterValue === 'No' ? (
        <FontAwesomeIcon
          icon={faCircleXmark}
          onClick={handleFilterByUnfinished}
        />
      ) : null}
      {filterValue === 'Yes' ? (
        <FontAwesomeIcon
          icon={faCircleCheck}
          onClick={handleFilterByFinished}
        />
      ) : null}
      {column.id}
    </Stack>
  )
}

export default FilterByStatus
