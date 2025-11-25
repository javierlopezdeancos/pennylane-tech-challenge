import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretUp,
  faCaretDown,
  faSort,
} from '@fortawesome/free-solid-svg-icons'
import { ReactElement } from 'react'

function SortableHeader({ column }: { column: any }): ReactElement | null {
  const getSortIcon = () => {
    if (!(column as any).canSort) {
      return null
    }

    if ((column as any).isSorted) {
      if ((column as any).isSortedDesc) {
        return (
          <FontAwesomeIcon
            icon={faCaretUp}
            size="sm"
            color="#0c6efd"
            style={{ paddingTop: '4px' }}
          />
        )
      } else {
        return (
          <FontAwesomeIcon
            icon={faCaretDown}
            size="sm"
            color="#0c6efd"
            style={{ paddingTop: '2px' }}
          />
        )
      }
    }

    return (
      <FontAwesomeIcon icon={faSort} size="xs" style={{ paddingTop: '2px' }} />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {column.render('Header')}
      {getSortIcon()}
    </div>
  )
}

export default SortableHeader
