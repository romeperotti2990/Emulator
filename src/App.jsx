import Navbar from './components/Navbar'
import Create from './Create'
import Login from './Login'
import Page from './Page'
import Favorites from './Favorites'
import { Routes, Route, Navigate } from 'react-router-dom'
import NotFound from './components/NotFound'
import { useAuth } from './services/AuthContext'

// This component protects routes that require a login
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<Create />} />

        {/* These routes are now protected */}
        <Route
          path="/page"
          element={<ProtectedRoute><Page /></ProtectedRoute>}
        />
        <Route
          path="/favorites"
          element={<ProtectedRoute><Favorites /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}