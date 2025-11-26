import { useApi } from 'api'
import { ReactElement, useState, useEffect } from 'react'
import { Modal, Button, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-regular-svg-icons'

function InvoiceDelete({
  invoiceId,
  onCancel,
  onFailure,
  onLoading,
  onSuccess,
  open = false,
}: {
  invoiceId?: number
  onCancel?: () => void
  onFailure?: (error: unknown) => void
  onLoading?: (loading: boolean) => void
  onSuccess?: () => void
  open?: boolean
}): ReactElement {
  const api = useApi()

  const [showModal, setShowModal] = useState(open)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)
  const [failureMessage, setFailureMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setShowModal(open)
  }, [open])

  const handleClose = () => {
    if (onCancel) {
      onCancel()
    }

    setShowModal(false)
  }

  const handleConfirm = async () => {
    if (!invoiceId) return

    setLoading(true)

    if (onLoading) {
      onLoading(true)
    }

    try {
      await api.deleteInvoice({ id: invoiceId })

      setShowSuccess(true)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err)

      setShowFailure(true)

      setFailureMessage(
        'Failed deleting invoice ' +
          invoiceId +
          ' because, ' +
          JSON.parse(err.response.request.response).message +
          '.'
      )

      if (onFailure) {
        onFailure(err)
      }
    } finally {
      setLoading(false)

      if (onLoading) {
        onLoading(false)
      }

      setShowModal(false)
    }
  }

  const handleCloseSuccessToast = () => setShowSuccess(false)

  const handleCloseFailureToast = () => setShowFailure(false)

  return (
    <>
      <Modal show={showModal} onHide={handleClose} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently delete invoice #{invoiceId}. Are you sure?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="bottom-end">
        <Toast
          show={showSuccess}
          onClose={handleCloseSuccessToast}
          bg="success"
          delay={3000}
          autohide
        >
          <Toast.Header>
            <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>Invoice {invoiceId} deleted.</Toast.Body>
        </Toast>
      </ToastContainer>
      <ToastContainer position="bottom-end">
        <Toast
          show={showFailure}
          onClose={handleCloseFailureToast}
          bg="danger"
          delay={3000}
          autohide
        >
          <Toast.Header>
            <FontAwesomeIcon icon={faCircleXmark} className="me-2" />
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{failureMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default InvoiceDelete
