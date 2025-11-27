import { ReactNode } from 'react'
import { Container, Navbar, Nav } from 'react-bootstrap'
import Logo from '../Logo'

const PageLayout: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <div>
      <header>
        <Navbar bg="white" expand="lg">
          <Container>
            <Navbar.Brand href="/">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Logo width={30} />{' '}
                <span className="fs-2 fw-bolder" style={{ color: '#006667' }}>
                  invoiceditor
                </span>
              </div>
            </Navbar.Brand>
            <Nav className="ms-auto" />
          </Container>
        </Navbar>
      </header>
      <main className="container">{children}</main>
    </div>
  )
}

export default PageLayout
