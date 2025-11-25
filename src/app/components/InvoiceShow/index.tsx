import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap'
import GoBack from '../GoBack'
import { useApi } from 'api'
import { Invoice } from 'types'
import InvoiceShowSkeleton from './InvoiceShowSkeleton'

const InvoiceShow = () => {
  const { id } = useParams<{ id: string }>()
  const api = useApi()

  const [invoice, setInvoice] = useState<Invoice>()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (invoice) {
      return
    }

    api.getInvoice(id).then(({ data }) => {
      setInvoice(data)
      setLoading(false)
    })
  }, [api, id, invoice])

  if (loading) {
    return <InvoiceShowSkeleton />
  }

  if (!invoice) {
    return (
      <Container>
        <Card className="mt-4">
          <Card.Body>
            <p>Invoice not found</p>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  const invoiceLines = (invoice as any).invoice_lines || []

  const totalAmount = invoiceLines.reduce(
    (sum: number, line: any) =>
      sum + (parseFloat(line.price) || 0) * (line.quantity || 0),
    0
  )

  const totalTax = invoiceLines.reduce(
    (sum: number, line: any) => sum + (parseFloat(line.tax) || 0),
    0
  )

  const openFinalize = () => setShowFinalizeModal(true)
  const closeFinalize = () => setShowFinalizeModal(false)

  const openRemove = () => setShowRemoveModal(true)
  const closeRemove = () => setShowRemoveModal(false)

  const confirmFinalize = async () => {
    if (!invoice) {
      return
    }

    setActionLoading(true)

    try {
      const { data } = await api.putInvoice(
        { id: invoice.id },
        { invoice: { id: invoice.id, finalized: true } }
      )
      setInvoice(data)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setActionLoading(false)
      setShowFinalizeModal(false)
    }
  }

  const confirmRemove = async () => {
    if (!invoice) {
      return
    }

    setActionLoading(true)

    try {
      await api.deleteInvoice({ id: invoice.id })

      setActionLoading(false)
      setShowRemoveModal(false)

      navigate(-1)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setActionLoading(false)
    }
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <GoBack />
          <h1>Invoice {invoice.id}</h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>
              <Card.Title className="mb-0">Customer Information</Card.Title>
            </Card.Header>
            <Card.Body>
              <table className="w-100">
                <tbody>
                  <tr>
                    <td className="fw-bold" style={{ width: '40%' }}>
                      Name:
                    </td>
                    <td>
                      {invoice.customer?.first_name}{' '}
                      {invoice.customer?.last_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Address:</td>
                    <td>{invoice.customer?.address}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">City:</td>
                    <td>
                      {invoice.customer?.zip_code} {invoice.customer?.city}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Country:</td>
                    <td>
                      {invoice.customer?.country} (
                      {invoice.customer?.country_code})
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Customer ID:</td>
                    <td>{invoice.customer?.id}</td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>
              <Card.Title className="mb-0">Invoice Information</Card.Title>
            </Card.Header>
            <Card.Body>
              <table className="w-100">
                <tbody>
                  <tr>
                    <td className="fw-bold" style={{ width: '40%' }}>
                      Invoice Date:
                    </td>
                    <td>{invoice.date}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Deadline:</td>
                    <td>{invoice.deadline}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Status:</td>
                    <td>
                      {invoice.finalized ? (
                        <Badge bg="success">Finalized</Badge>
                      ) : (
                        <Badge bg="secondary">Draft</Badge>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Payment Status:</td>
                    <td>
                      {invoice.paid ? (
                        <Badge bg="success">Paid</Badge>
                      ) : (
                        <Badge bg="danger">Unpaid</Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Invoice Items</Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-center">Quantity</th>
                    <th>Unit</th>
                    <th className="text-end">VAT Rate</th>
                    <th className="text-end">Tax</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceLines.map((line: any) => (
                    <tr key={line.id}>
                      <td>
                        <div>{line.label}</div>
                        <small className="text-muted">
                          ID: {line.product_id}
                        </small>
                      </td>
                      <td className="text-end">
                        ${parseFloat(line.price || 0).toFixed(2)}
                      </td>
                      <td className="text-center">{line.quantity}</td>
                      <td>{line.unit}</td>
                      <td className="text-end">{line.vat_rate}%</td>
                      <td className="text-end">
                        ${parseFloat(line.tax || 0).toFixed(2)}
                      </td>
                      <td className="text-end fw-bold">
                        $
                        {(
                          parseFloat(line.price || 0) * (line.quantity || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={{ offset: 6, span: 6 }}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col>Subtotal:</Col>
                <Col className="text-end fw-bold">
                  ${(totalAmount - totalTax).toFixed(2)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>Tax:</Col>
                <Col className="text-end fw-bold">${totalTax.toFixed(2)}</Col>
              </Row>
              <Row className="border-top pt-3">
                <Col className="fw-bold">Total:</Col>
                <Col className="text-end fw-bold fs-5">
                  ${totalAmount.toFixed(2)}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div
        style={{ position: 'sticky', bottom: 0, zIndex: 20 }}
        className="bg-white border-top py-2"
      >
        <div className="container d-flex justify-content-end">
          <div className="d-flex gap-2">
            <Button
              variant="danger"
              onClick={openRemove}
              disabled={actionLoading}
            >
              {actionLoading && showRemoveModal ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              REMOVE
            </Button>
            <Button
              variant="primary"
              onClick={openFinalize}
              disabled={invoice.finalized || actionLoading}
            >
              {actionLoading && showFinalizeModal ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              FINALIZE
            </Button>
          </div>
        </div>
      </div>
      <Modal show={showFinalizeModal} onHide={closeFinalize} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Finalize</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark invoice #{invoice.id} as finalized?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeFinalize}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmFinalize}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showRemoveModal} onHide={closeRemove} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently delete invoice #{invoice.id}. Are you sure?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeRemove}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmRemove}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default InvoiceShow
