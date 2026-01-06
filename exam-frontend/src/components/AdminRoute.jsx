import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

 console.log('🔍 AdminRoute - Auth State:', {
    loading,
    user: user ? {
      email: user.email,
      role: user.role,
      id: user.id
    } : 'No user'
  });


  if (loading) return <Loader />

   if (!user) {
    return <Navigate to="/login" replace />
  }
   // ❌ Login hai but admin nahi
  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />
  }


  // const isAdmin = user && (user.isAdmin || user.role === 'admin')

  // if (!isAdmin) {
  //   return <Navigate to="/home" replace />
  // }
console.log("ADMIN ROUTE → user:", user, "loading:", loading)

  return children
}

export default AdminRoute
