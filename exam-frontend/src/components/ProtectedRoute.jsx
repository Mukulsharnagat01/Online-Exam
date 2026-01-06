import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
console.log('ProtectedRoute - User:', user, 'Loading:', loading);
  if (loading) return <Loader />

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute;

