import { Container, Row, Col, Card } from 'react-bootstrap'
import classnames from 'classnames'

const Shimmer = () => (
  <style>
    {`
    .shimmer-pair {
      animation: shimmer 2.5s infinite linear;
      background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
      background-size: 1000px 100%;
    }

    .shimmer-odd {
      animation: shimmer 2.5s infinite linear;
      background: linear-gradient(to right, #e0e0e0 4%, #f0f0f0 25%, #e0e0e0 36%);
      background-size: 1000px 100%;
    }

    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `}
  </style>
)

const SkeletonLine = ({
  width = '100%',
  isOdd = false,
}: {
  width?: string
  isOdd?: boolean
}) => (
  <div
    className={classnames({
      'shimmer-pair': !isOdd,
      'shimmer-odd': isOdd,
    })}
    style={{
      height: '20px',
      borderRadius: '4px',
      opacity: '0.7',
      width,
      marginBottom: '12px',
    }}
  />
)

const InvoiceShowSkeleton = () => {
  return (
    <Container className="mt-4">
      <Shimmer />
      <Row className="mb-4">
        <Col>
          <SkeletonLine width="200px" />
        </Col>
        <Col className="text-end">
          <SkeletonLine width="200px" />
        </Col>
      </Row>
      <Row className="mb-4">
        {/* Customer Info */}
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>
              <SkeletonLine width="150px" />
            </Card.Header>
            <Card.Body>
              {[...Array(5)].map((_, i) => (
                <SkeletonLine key={i} isOdd={i % 2 !== 0} />
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>
              <SkeletonLine width="150px" />
            </Card.Header>
            <Card.Body>
              {[...Array(4)].map((_, i) => (
                <SkeletonLine key={i} isOdd={i % 2 !== 0} />
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <SkeletonLine width="150px" />
            </Card.Header>
            <Card.Body className="p-0">
              <table className="w-100">
                <tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {[...Array(7)].map((_, colIndex) => (
                        <td key={colIndex} style={{ padding: '12px' }}>
                          <SkeletonLine
                            isOdd={rowIndex % 2 !== 0}
                            width="90%"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={{ offset: 6, span: 6 }}>
          <Card>
            <Card.Body>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <SkeletonLine isOdd={i % 2 !== 0} />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default InvoiceShowSkeleton
