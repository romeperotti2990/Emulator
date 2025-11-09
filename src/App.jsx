import Create from './Create'
import Login from './Login'
import Page from './Page'
import { Routes, Route } from 'react-router'

export default function App() {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path='/page' element={<Page />} />
      </Routes>
    )
}