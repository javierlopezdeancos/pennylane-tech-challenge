import { useApi } from 'api'
import { ReactElement, useState, useEffect } from 'react'
import { Modal, Button, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-regular-svg-icons'
import { Invoice } from 'types'

function InvoicePay({
  invoiceId,
  onCancel,
  onFailure,
  onSuccess,
  open = false,
}: {
  invoiceId?: number
  onCancel?: () => void
  onFailure?: (error: unknown) => void
  onSuccess?: (invoice: Invoice) => void
  open?: boolean
}): ReactElement {
  const api = useApi()

  const [showModal, setShowModal] = useState(open)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)
  const [failureMessage, setFailureMessage] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    setShowModal(open)
  }, [open])

  const handleClosePayModal = () => {
    if (onCancel) {
      onCancel()
    }

    setShowModal(false)
  }

  const handleConfirmPay = async () => {
    if (!invoiceId) {
      return
    }

    setPayLoading(true)

    try {
      const { data } = await api.putInvoice(
        {
          id: invoiceId,
        },
        {
          invoice: {
            id: invoiceId,
            paid: true,
          },
        }
      )

      setShowSuccess(true)

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console -- we want to log errors and don't allow silent errors
      console.error(err)

      setShowFailure(true)

      setFailureMessage(
        'Failed paying invoice ' +
          invoiceId +
          ' because, ' +
          JSON.parse(err.response.request.response).message +
          '.'
      )

      if (onFailure) {
        onFailure(err)
      }
    } finally {
      setPayLoading(false)
      setShowModal(false)
    }
  }

  const handleCloseSuccessToast = () => {
    setShowSuccess(false)
  }

  const handleCloseFailureToast = () => {
    setShowFailure(false)
  }

  return (
    <>
      <Modal show={showModal} onHide={handleClosePayModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark invoice #{invoiceId} as paid?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={handleClosePayModal}
            disabled={payLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPay}
            disabled={payLoading}
          >
            {payLoading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            Confirm
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
          <Toast.Body>Your invoice {invoiceId} has been paid.</Toast.Body>
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

export default InvoicePay
