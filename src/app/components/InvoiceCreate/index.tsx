import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Toast,
  ToastContainer,
} from 'react-bootstrap'
import GoBack from '../GoBack'
import CustomerAutocomplete from '../CustomerAutocomplete'
import ProductAutocomplete from '../ProductAutocomplete'
import { useApi } from 'api'
import { Product, Customer } from 'types'

const emptyLine = { product: null as Product | null, quantity: 1 }

const InvoiceCreate = (): React.ReactElement => {
  const api = useApi()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<Customer | null>(null)

  const [finalized, setFinalized] = useState(false)

  const [paid, setPaid] = useState(false)

  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  )

  const [deadline, setDeadline] = useState<string>('')

  const [lines, setLines] = useState<
    Array<{ product: Product | null; quantity: number }>
  >([{ ...emptyLine }])

  const [submitting, setSubmitting] = useState(false)

  const [toast, setToast] = useState<{
    show: boolean
    msg: string
    success: boolean
  }>({ show: false, msg: '', success: true })

  const canSubmit = () => {
    if (!customer) {
      return false
    }

    if (!lines || lines.length === 0) {
      return false
    }

    for (const l of lines) {
      if (!l.product || !l.product.id) {
        return false
      }

      if (!l.quantity || l.quantity <= 0) {
        return false
      }
    }

    return true
  }

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }])

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx))

  const setLineProduct = (idx: number, product: Product | null) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, product } : l)))

  const setLineQuantity = (idx: number, q: number) =>
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, quantity: q } : l))
    )

  const handleChangeAutocomplete = (customer: Customer | null) => {
    setCustomer(customer)
  }

  const handleChangeFinalized = (checked: boolean) => {
    setFinalized(checked)
  }

  const handleChangePaid = (checked: boolean) => {
    setPaid(checked)
  }

  const handleChangeDate = (date: string) => {
    setDate(date)
  }

  const handleChangeDeadline = (deadline: string) => {
    setDeadline(deadline)
  }

  const handleRemoveLine = (lineNumber: number) => {
    removeLine(lineNumber)
  }

  const handleChangeLineProduct = (
    lineNumber: number,
    product: Product | null
  ) => {
    setLineProduct(lineNumber, product)
  }

  const handleChangeLineQuality = (lineNumber: number, quality: number) => {
    setLineQuantity(lineNumber, quality)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const handleSubmit = async () => {
    if (!canSubmit()) {
      return
    }

    setSubmitting(true)

    const payload: any = {
      invoice: {
        customer_id: customer!.id,
        finalized,
        paid,
        date: date || null,
        deadline: deadline || null,
        invoice_lines_attributes: lines.map((l) => ({
          product_id: l.product!.id,
          quantity: l.quantity,
        })),
      },
    }

    try {
      const { data } = await api.postInvoices(undefined, payload)

      if (!data) {
        console.error('No data returned from server when creating invoice')
        return
      }

      setToast({
        show: true,
        msg: `Invoice ${data.id} created.`,
        success: true,
      })

      setTimeout(() => navigate(`/invoice/${data.id}`), 3500)
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err)

      setToast({
        show: true,
        msg: 'Failed creating invoice',
        success: false,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <div>
            <GoBack />
            <h1>Create Invoice</h1>
          </div>
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Create invoice</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Customer</Form.Label>
                  <CustomerAutocomplete
                    value={customer}
                    onChange={(c: Customer | null) =>
                      handleChangeAutocomplete(c)
                    }
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
                          onChange={(e) =>
                            handleChangeFinalized(e.target.checked)
                          }
                        />
                        <Form.Check
                          id="invoice-paid"
                          className="mt-3"
                          type="checkbox"
                          label="Paid"
                          checked={paid}
                          onChange={(e) => handleChangePaid(e.target.checked)}
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
                                onChange={(e) =>
                                  handleChangeDate(e.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Deadline</Form.Label>
                              <Form.Control
                                type="date"
                                value={deadline}
                                onChange={(e) =>
                                  handleChangeDeadline(e.target.value)
                                }
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
                    <Card.Subtitle className="mb-2">Lines</Card.Subtitle>
                    <Card.Text>Select a product and its quantity</Card.Text>
                    {lines.map((l, idx) => (
                      <Row key={idx} className="align-items-center mb-2">
                        <Col md={6}>
                          <ProductAutocomplete
                            value={l.product}
                            onChange={(p) => handleChangeLineProduct(idx, p)}
                          />
                        </Col>
                        <Col md={3}>
                          <InputGroup>
                            <Form.Control
                              type="number"
                              min={1}
                              value={l.quantity}
                              onChange={(e) =>
                                handleChangeLineQuality(
                                  idx,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </InputGroup>
                        </Col>
                        <Col md={3}>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleRemoveLine(idx)}
                            disabled={lines.length === 1}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Button variant="link" onClick={addLine} className="p-0">
                      + Add line
                    </Button>
                  </Card.Body>
                </Card>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="danger"
                    className="me-2"
                    onClick={handleCancel}
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
                    Create
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

export default InvoiceCreate
