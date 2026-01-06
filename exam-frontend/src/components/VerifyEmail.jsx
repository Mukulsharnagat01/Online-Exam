import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  // Get email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      // If no email in state, go back to register
      toast.error('No verification pending')
      navigate('/register')
    }
  }, [location, navigate])

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!code || code.length !== 6) {
      toast.error('Please enter 6-digit code')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.verifyEmail(code)
      
      if (response.success) {
        toast.success('Email verified successfully!')
        navigate('/') // Go to home or login
      } else {
        toast.error(response.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Email</h2>
        
        <p className="mb-4 text-center">
          Code sent to: <span className="font-semibold">{email}</span>
        </p>
        
        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border rounded-lg text-center text-2xl"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full mt-4 text-gray-600 hover:text-gray-800"
          >
            Back to Register
          </button>
        </form>
      </div>
    </div>
  )
}

export default VerifyEmail