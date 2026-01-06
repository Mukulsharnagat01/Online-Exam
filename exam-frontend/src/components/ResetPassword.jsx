import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { newPassword, confirmPassword } = formData
    
    if (!token) {
      toast.error('Invalid reset link')
      return
    }
    
    if (!newPassword || !confirmPassword) {
      toast.error('Both fields are required')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.resetPassword(token, newPassword)
      
      if (response.success) {
        toast.success('Password reset successfully!')
        navigate('/login')
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="At least 6 characters"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword