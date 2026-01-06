import { useState } from 'react'
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password required')
      return
    }

    setLoading(true)

    try {
      const response = await login(formData.email, formData.password)
 console.log('📦 Login response in component:', response);

      if (response.success) {
        toast.success('Login successful!')
          console.log('✅ Login successful, user:', response.user);

        if (response.user?.role === 'admin') {
    navigate('/admin-dashboard')   
        } else{
        navigate('/home')}
      } else {
        toast.error(response.message || 'Login failed')
      }
    } catch (error) {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full p-3 border rounded-lg"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}  
              autoComplete="current-password"
              className="w-full p-3 border rounded-lg"
              placeholder="Your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center space-y-2">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login;