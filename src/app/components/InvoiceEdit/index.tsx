import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Toast,
  ToastContainer,
  Alert,
} from 'react-bootstrap'
import GoBack from '../GoBack'
import CustomerAutocomplete from '../CustomerAutocomplete'
import ProductAutocomplete from '../ProductAutocomplete'
import { useApi } from 'api'
import { Product, Customer } from 'types'

interface LineEdit {
  id?: number
  product: Product | null
  quantity: number
  _destroy: boolean
}

const emptyLine: LineEdit = { product: null, quantity: 1, _destroy: false }

const InvoiceEdit = (): React.ReactElement => {
  const { id } = useParams<{ id: string }>()
  const api = useApi()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [customer, setCustomer] = useState<Customer | null>(null)

  const [finalized, setFinalized] = useState(false)

  const [paid, setPaid] = useState(false)

  const [date, setDate] = useState<string>('')

  const [deadline, setDeadline] = useState<string>('')

  const [lines, setLines] = useState<LineEdit[]>([{ ...emptyLine }])

  const [submitting, setSubmitting] = useState(false)

  const [toast, setToast] = useState<{
    show: boolean
    msg: string
    success: boolean
  }>({ show: false, msg: '', success: true })

  const calculateLineSubtotal = (line: LineEdit): number => {
    if (!line.product || line._destroy) return 0
    return parseFloat(line.product.unit_price_without_tax) * line.quantity
  }

  const calculateLineTax = (line: LineEdit): number => {
    if (!line.product || line._destroy) return 0
    return parseFloat(line.product.unit_tax) * line.quantity
  }

  const calculateLineTotal = (line: LineEdit): number => {
    if (!line.product || line._destroy) return 0
    return parseFloat(line.product.unit_price) * line.quantity
  }

  const invoiceTotals = useMemo(() => {
    const activeLines = lines.filter((l) => !l._destroy && l.product)

    const subtotal = activeLines.reduce(
      (sum, line) => sum + calculateLineSubtotal(line),
      0
    )

    const tax = activeLines.reduce(
      (sum, line) => sum + calculateLineTax(line),
      0
    )

    const total = activeLines.reduce(
      (sum, line) => sum + calculateLineTotal(line),
      0
    )

    return { subtotal, tax, total }
  }, [lines])

  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2)
  }

  useEffect(() => {
    if (!id) {
      return
    }

    const fetchInvoice = async () => {
      try {
        const { data } = await api.getInvoice(id)

        setFinalized(data.finalized || false)
        setPaid(data.paid || false)
        setDate(data.date || '')
        setDeadline(data.deadline || '')

        if ((data as any).customer) {
          setCustomer((data as any).customer)
        }

        if (data.invoice_lines && data.invoice_lines.length > 0) {
          setLines(
            data.invoice_lines.map((line: any) => ({
              id: line.id,
              product: line.product || null,
              quantity: line.quantity,
              _destroy: false,
            }))
          )
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch invoice:', err)

        setToast({
          show: true,
          msg: 'Failed to fetch invoice',
          success: false,
        })
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [api, id])

  const validationErrors = useMemo(() => {
    const errors: string[] = []

    if (!customer) {
      errors.push('Please select a customer')
    }

    if (!lines || lines.length === 0) {
      errors.push('Please add at least one line item')
      return errors
    }

    const activeLines = lines.filter((l) => !l._destroy)

    if (activeLines.length === 0) {
      errors.push('Please add at least one active line item')
      return errors
    }

    const linesWithoutProduct = activeLines
      .map((l, idx) => ({ line: l, index: idx + 1 }))
      .filter((item) => !item.line.product || !item.line.product.id)

    if (linesWithoutProduct.length > 0) {
      const lineNumbers = linesWithoutProduct
        .map((item) => item.index)
        .join(', ')
      errors.push(`Line ${lineNumbers}: Please select a product`)
    }

    const linesWithInvalidQuantity = activeLines
      .map((l, idx) => ({ line: l, index: idx + 1 }))
      .filter((item) => !item.line.quantity || item.line.quantity <= 0)

    if (linesWithInvalidQuantity.length > 0) {
      const lineNumbers = linesWithInvalidQuantity
        .map((item) => item.index)
        .join(', ')
      errors.push(`Line ${lineNumbers}: Quantity must be greater than 0`)
    }

    return errors
  }, [customer, lines])

  const canSubmit = () => {
    return validationErrors.length === 0
  }

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }])

  const toggleDestroyLine = (idx: number) =>
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, _destroy: !l._destroy } : l))
    )

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx))

  const setLineProduct = (idx: number, product: Product | null) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, product } : l)))

  const setLineQuantity = (idx: number, q: number) =>
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, quantity: q } : l))
    )

  const handleSubmit = async () => {
    if (!canSubmit() || !id) {
      return
    }

    setSubmitting(true)

    const payload: any = {
      invoice: {
        id: parseInt(id),
        customer_id: customer!.id,
        finalized,
        paid,
        date: date || null,
        deadline: deadline || null,
        invoice_lines_attributes: lines.map((l) => ({
          id: l.id,
          _destroy: l._destroy,
          product_id: !l._destroy && l.product ? l.product.id : undefined,
          quantity: !l._destroy ? l.quantity : undefined,
        })),
      },
    }

    try {
      const { data } = await api.putInvoice({ id: parseInt(id) }, payload)

      setToast({
        show: true,
        msg: `Invoice ${data.id} updated.`,
        success: true,
      })

      setTimeout(() => navigate(`/invoice/${id}`), 3500)
    } catch (err: any) {
      console.error(err)

      setToast({
        show: true,
        msg: 'Failed updating invoice',
        success: false,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Spinner animation="border" />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Col>
          <div>
            <GoBack />
            <h1>Edit Invoice</h1>
          </div>
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Edit invoice</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Customer</Form.Label>
                  <CustomerAutocomplete
                    value={customer}
                    onChange={(c) => setCustomer(c)}
                  />
                </Form.Group>
                <Row className="mb-3">
                  <Col md={3}>
                    <Card className="mb-3 h-100">
                      <Card.Body>
                        <Card.Subtitle className="mb-2">
                          Invoice Properties
                        </Card.Subtitle>
                        <Form.Check
                          id="invoice-finalized"
                          className="mt-3"
                          type="checkbox"
                          label="Finalized"
                          checked={finalized}
                          onChange={(e) => setFinalized(e.target.checked)}
                        />
                        <Form.Check
                          id="invoice-paid"
                          className="mt-3"
                          type="checkbox"
                          label="Paid"
                          checked={paid}
                          onChange={(e) => setPaid(e.target.checked)}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={9}>
                    <Card className="mb-3 h-100">
                      <Card.Body>
                        <Card.Subtitle className="mb-2">
                          Invoice Dates
                        </Card.Subtitle>
                        <Row className="mb-3 mt-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Deadline</Form.Label>
                              <Form.Control
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Subtitle className="mb-3">Lines</Card.Subtitle>
                    <Row className="mb-2 fw-bold text-muted small">
                      <Col md={4}>Product</Col>
                      <Col md={1} className="text-center">
                        Quantity
                      </Col>
                      <Col md={2} className="text-end">
                        Subtotal
                      </Col>
                      <Col md={2} className="text-end">
                        Tax
                      </Col>
                      <Col md={2} className="text-end">
                        Total
                      </Col>
                      <Col md={1}></Col>
                    </Row>
                    {lines.map((l, idx) => (
                      <Row
                        key={idx}
                        className="align-items-center mb-2 py-2 border-bottom"
                        style={{
                          opacity: l._destroy ? 0.5 : 1,
                          textDecoration: l._destroy ? 'line-through' : 'none',
                        }}
                      >
                        <Col md={4}>
                          <ProductAutocomplete
                            value={l.product}
                            onChange={(p) => setLineProduct(idx, p)}
                          />
                        </Col>
                        <Col md={1}>
                          <Form.Control
                            type="number"
                            min={1}
                            value={l.quantity}
                            onChange={(e) =>
                              setLineQuantity(idx, Number(e.target.value))
                            }
                            disabled={l._destroy}
                            size="sm"
                            className="text-center"
                          />
                        </Col>
                        <Col md={2} className="text-end">
                          <span className="text-muted">
                            {l.product && !l._destroy
                              ? `€${formatCurrency(calculateLineSubtotal(l))}`
                              : '-'}
                          </span>
                        </Col>
                        <Col md={2} className="text-end">
                          <span className="text-muted">
                            {l.product && !l._destroy
                              ? `€${formatCurrency(calculateLineTax(l))}`
                              : '-'}
                          </span>
                        </Col>
                        <Col md={2} className="text-end">
                          <span className="fw-semibold">
                            {l.product && !l._destroy
                              ? `€${formatCurrency(calculateLineTotal(l))}`
                              : '-'}
                          </span>
                        </Col>
                        <Col md={1} className="text-end">
                          {l.id ? (
                            <Button
                              variant={
                                l._destroy ? 'success' : 'outline-danger'
                              }
                              onClick={() => toggleDestroyLine(idx)}
                              size="sm"
                            >
                              {l._destroy ? 'Restore' : 'Remove'}
                            </Button>
                          ) : (
                            <Button
                              variant="outline-danger"
                              onClick={() => removeLine(idx)}
                              disabled={
                                lines.filter((x) => !x._destroy).length === 1
                              }
                              size="sm"
                            >
                              Remove
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                    <Button variant="link" onClick={addLine} className="p-0">
                      + Add line
                    </Button>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Subtitle className="mb-3">
                      Invoice Totals
                    </Card.Subtitle>
                    <Row className="mb-2">
                      <Col md={9} className="text-end text-muted">
                        Subtotal (excl. tax):
                      </Col>
                      <Col md={3} className="text-end">
                        €{formatCurrency(invoiceTotals.subtotal)}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={9} className="text-end text-muted">
                        Tax:
                      </Col>
                      <Col md={3} className="text-end">
                        €{formatCurrency(invoiceTotals.tax)}
                      </Col>
                    </Row>
                    <hr />
                    <Row className="fw-bold fs-5">
                      <Col md={9} className="text-end">
                        Total:
                      </Col>
                      <Col md={3} className="text-end">
                        €{formatCurrency(invoiceTotals.total)}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                {validationErrors.length > 0 && (
                  <Alert variant="warning" className="mb-3">
                    <Alert.Heading className="h6 mb-2">
                      Please fix the following issues:
                    </Alert.Heading>
                    <ul className="mb-0 ps-3">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
                <div className="d-flex justify-content-end">
                  <Button
                    variant="danger"
                    className="me-2"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit() || submitting}
                  >
                    {submitting ? (
                      <Spinner size="sm" animation="border" className="me-2" />
                    ) : null}
                    Update
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer position="bottom-end">
        <Toast
          show={toast.show}
          onClose={() => setToast((s) => ({ ...s, show: false }))}
          bg={toast.success ? 'success' : 'danger'}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.success ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.success ? '' : 'text-white'}>
            {toast.msg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}

export default InvoiceEdit
