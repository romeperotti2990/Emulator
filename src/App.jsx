import Navbar from './components/Navbar'
import Create from './Pages/Create'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Search from './components/Search'
import Game from './Pages/Game'
import Favorites from './Pages/Favorites'
import { Routes, Route, Navigate } from 'react-router-dom'
import NotFound from './components/NotFound'
import { useAuth } from './services/AuthContext'

// This component protects routes that require a login
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />

        <Route 
          path="/" 
          element={<ProtectedRoute><Home /></ProtectedRoute>} 
        />
        <Route
          path="/search"
          element={<ProtectedRoute><Search /></ProtectedRoute>}
        />
        <Route
          path="/game"
          element={<ProtectedRoute><Game /></ProtectedRoute>}
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