import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons'

const GoBack = () => {
  const navigate = useNavigate()

  return (
    <Button variant="link" onClick={() => navigate(-1)}>
      <FontAwesomeIcon icon={faCaretLeft} /> go to home
    </Button>
  )
}

export default GoBack
