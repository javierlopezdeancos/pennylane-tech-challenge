import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons'

const GoBack = ({ backIsRoot = false }: { backIsRoot?: boolean }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (backIsRoot) {
      navigate('/')
    } else {
      navigate(-1)
    }
  }

  return (
    <Button variant="link" onClick={handleClick}>
      <FontAwesomeIcon icon={faCaretLeft} /> go back
    </Button>
  )
}

export default GoBack
