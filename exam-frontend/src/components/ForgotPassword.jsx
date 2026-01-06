// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { authAPI } from '../services/api'
// import toast from 'react-hot-toast'

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [sent, setSent] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
    
//     if (!email) {
//       toast.error('Email is required')
//       return
//     }

//     setLoading(true)

//     try {
//       const response = await authAPI.forgotPassword(email)
      
//       if (response.success) {
//         toast.success('Check your email for reset instructions')
//         setSent(true)
//       } else {
//         toast.error(response.message)
//       }
//     } catch (error) {
//       toast.error('Request failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-96">
//         <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        
//         {sent ? (
//           <div className="text-center">
//             <div className="text-green-600 mb-4">
//               Check your email for reset instructions
//             </div>
//             <Link to="/login" className="text-blue-600 hover:underline">
//               Back to Login
//             </Link>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full p-3 border rounded-lg"
//                 placeholder="you@example.com"
//                 required
//               />
//             </div>
            
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
//             >
//               {loading ? 'Sending...' : 'Send Reset Instructions'}
//             </button>
            
//             <div className="text-center">
//               <Link to="/login" className="text-blue-600 hover:underline">
//                 Back to Login
//               </Link>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ForgotPassword



import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Enter email, 2: Enter OTP, 3: Set new password
  const [resetToken, setResetToken] = useState('')

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Email is required')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.forgotPassword(email)
      
      if (response.success) {
        
        toast.success('OTP sent to your email!')
        setStep(2) // Move to OTP verification step
        
        // Debug: Agar test token mila hai
        if (response.testToken) {
          console.log('🔑 OTP for testing:', response.testToken)
          setResetToken(response.testToken)
          setOtp(response.testToken) // Auto-fill for testing
        }
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      // Verify OTP with backend
      const response = await authAPI.verifyResetOTP(email, otp)
      
      if (response.success) {
        toast.success('OTP verified!')
        setResetToken(otp) // Save the token
        setStep(3) // Move to password reset step
      } else {
        toast.error(response.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Both password fields are required')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.resetPassword(resetToken, newPassword)
      
      if (response.success) {
        toast.success('Password reset successfully!')
        navigate('/login')
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Reset error:', error)
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // Go back to previous step
  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setOtp('')
    } else if (step === 3) {
      setStep(2)
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          {step === 1 ? 'Forgot Password' : 
           step === 2 ? 'Verify OTP' : 
           'Reset Password'}
        </h1>
        
        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your registered email to receive OTP
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <div className="text-center pt-4 border-t">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
        
        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter OTP sent to: <span className="text-blue-600">{email}</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Check your email for 6-digit OTP
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleRequestOTP}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
        
        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Minimum 6 characters"
                minLength="6"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Re-enter new password"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword