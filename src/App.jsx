import Navbar from './components/Navbar'
import Create from './Create'
import Login from './Login'
import Page from './Page'
import { Routes, Route } from 'react-router'
import NotFound from './NotFound'

export default function App() {
    return (
      <>
        <Navbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/create" element={<Create />} />
            <Route path="/page" element={<Page />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </>
    )
}