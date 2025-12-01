import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
} from 'react-bootstrap'
import GoBack from '../GoBack'
import { useApi } from 'api'
import { Invoice } from 'types'
import InvoiceShowSkeleton from './InvoiceShowSkeleton'
import InvoiceFinalize from '../InvoiceFinalize'
import InvoiceDelete from '../InvoiceDelete'
import InvoicePay from '../InvoicePay'

const InvoiceShow = () => {
  const { id } = useParams<{ id: string }>()
  const api = useApi()
  const navigate = useNavigate()

  const [invoice, setInvoice] = useState<Invoice>()
  const [loading, setLoading] = useState(true)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
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

  const finalizeInvoice = () => setShowFinalizeModal(true)

  const deleteInvoice = () => setShowDeleteModal(true)

  const payInvoice = () => setShowPayModal(true)

  const handleFinalizeSuccess = (updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice)
    setShowFinalizeModal(false)
    setActionLoading(false)
  }

  const handleFinalizeFailure = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Failed to finalize invoice:', error)
    setActionLoading(false)
    setShowFinalizeModal(false)
  }

  const handleFinalizeCancel = () => {
    setActionLoading(false)
    setShowFinalizeModal(false)
  }

  const handleDeleteSuccess = () => {
    setActionLoading(false)
    setShowDeleteModal(false)
    navigate(-1)
  }

  const handleDeleteFailure = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Failed to delete invoice:', error)
    setActionLoading(false)
    setShowDeleteModal(false)
  }

  const handleDeleteCancel = () => {
    setActionLoading(false)
    setShowDeleteModal(false)
  }

  const handlePaySuccess = (updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice)
    setShowPayModal(false)
    setActionLoading(false)
  }

  const handlePayFailure = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Failed to pay invoice:', error)
    setActionLoading(false)
    setShowPayModal(false)
  }

  const handlePayCancel = () => {
    setActionLoading(false)
    setShowPayModal(false)
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <div>
            <GoBack backIsRoot />
            <h1>Invoice {invoice.id}</h1>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={payInvoice}
              disabled={invoice.paid || actionLoading}
            >
              {actionLoading && showPayModal ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              Pay Invoice
            </Button>
            <Button
              variant="primary"
              onClick={finalizeInvoice}
              disabled={invoice.finalized || actionLoading}
            >
              {actionLoading && showFinalizeModal ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              Finalize Invoice
            </Button>
            <Button
              variant="danger"
              onClick={deleteInvoice}
              disabled={actionLoading}
            >
              {actionLoading && showDeleteModal ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              Remove Invoice
            </Button>
          </div>
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
                      {invoice.customer?.country}
                      <ReactCountryFlag
                        countryCode={invoice.customer?.country_code || ''}
                        svg
                        style={{ marginLeft: '8px' }}
                      />
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
      <InvoiceFinalize
        invoiceId={invoice.id}
        onSuccess={handleFinalizeSuccess}
        onFailure={handleFinalizeFailure}
        onCancel={handleFinalizeCancel}
        open={showFinalizeModal}
      />
      <InvoiceDelete
        invoiceId={invoice.id}
        open={showDeleteModal}
        onLoading={(loading: boolean) => setActionLoading(loading)}
        onSuccess={handleDeleteSuccess}
        onFailure={handleDeleteFailure}
        onCancel={handleDeleteCancel}
      />
      <InvoicePay
        invoiceId={invoice.id}
        open={showPayModal}
        onSuccess={handlePaySuccess}
        onFailure={handlePayFailure}
        onCancel={handlePayCancel}
      />
    </Container>
  )
}

export default InvoiceShow
