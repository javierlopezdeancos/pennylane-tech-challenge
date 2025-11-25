import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import InvoicesList from './components/InvoicesList'
import InvoiceShow from './components/InvoiceShow'
import PageLayout from './components/PageLayout'

// import GettingStarted from './GettingStarted'

function App() {
  return (
    <div className="px-5">
      <Router>
        <PageLayout>
          <Routes>
            <Route path="/invoice/:id" Component={InvoiceShow} />
            <Route path="/" Component={InvoicesList} />
          </Routes>
        </PageLayout>
      </Router>
    </div>
  )
}

export default App
