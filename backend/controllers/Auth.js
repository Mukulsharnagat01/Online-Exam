


import { sendVerificationEamil, senWelcomeEmail, sendResetPasswordEmail } from "../middlewares/Email.js"
import { generateTokenAndSetCookies } from "../middlewares/GenerateToken.js"
import { Usermodel } from "../models/User.js"
import bcryptjs from 'bcryptjs'


// const checkLogin =async (req, res) => {
//   // 🔥 MOST IMPORTANT CHECK
//   if (!req.user) {
//     return res.status(401).json({
//       loggedIn: false,
//       message: 'Not authenticated'
//     });
//   }

const checkLogin = async (req, res) => {
  try {
    if (req.user) {
      return res.json({
        loggedIn: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role
        }
      });
    } else {
      return res.json({ loggedIn: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

  // // ✅ CONSISTENT RESPONSE
  // return res.status(200).json({
  //   loggedIn: true,
  //   user: {
  //     userId: req.user.userId,
  //     role: req.user.role,
  //     email: req.user.email,
  //     name: req.user.name
  //   }
  // });
// };

const Reigster=async(req,res)=>{
    try {
        const {email,password,name}=req.body
        if (!email || !password || !name) {
            return res.status(400).json({success:false,message:"All fields are required"})
        }
        const ExistsUser= await Usermodel.findOne({email})
        if (ExistsUser) {
            return res.status(400).json({success:false,message:"User Already Exists Please Login"})
            
        }
        const hasePassowrd= await bcryptjs.hashSync(password,10)
        const verficationToken= Math.floor(100000 + Math.random() * 900000).toString()
        const user= new Usermodel({
            email,
            password:hasePassowrd,
            name,
            verficationToken,
            verficationTokenExpiresAt:Date.now() + 24 * 60 * 60 * 1000
        })
        await user.save()
       generateTokenAndSetCookies(res,user._id)
       await sendVerificationEamil(user.email,verficationToken)

 
console.log(' Verification email sent to:', user.email)
return res.status(200).json({
      success: true,
      message: "User Register Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      verificationCode: verficationToken // Send code in response
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ // Changed to 500 for server errors
      success: false,
      message: "internal server error",
      error: error.message
    })
  }
}

const VerfiyEmail=async(req,res)=>{
    try {
        const {code}=req.body 
        const user= await Usermodel.findOne({
            verficationToken:code,
            verficationTokenExpiresAt:{$gt:Date.now()}
        })
        if (!user) {
            return res.status(400).json({success:false,message:"Inavlid or Expired Code"})
                
            }
          
     user.isVerified=true;
     user.verficationToken=undefined;
     user.verficationTokenExpiresAt=undefined;
     await user.save()

     await senWelcomeEmail(user.email,user.name)
     return res.status(200).json({success:true,message:"Email Verifed Successfully"})
           
    } catch (error) {
        console.log('❌ Verify email error:',error)
        return res.status(400).json({success:false,message:"internal server error"})
    }
}

// LOGIN FUNCTION
const Login = async (req, res) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            })
        }
        
        // 1. Find user
        const user = await Usermodel.findOne({ email })
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "User not found" 
            })
        }
        
        // 2. Check if email is verified
        if (!user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "Please verify your email first" 
            })
        }
        
        // 3. Check password
        const isPasswordCorrect = await bcryptjs.compare(password, user.password)
        
        if (!isPasswordCorrect) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid password" 
            })
        }
        
        // 4. Update last login
        user.lastLogin = Date.now()
        await user.save()
        
        // 5. Generate token
        const token = generateTokenAndSetCookies(res, user)
        
         return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token, // ✅ TOKEN भेजें frontend के लिए
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user' // ✅ role जरूर भेजें
            }
        })
        
    } catch (error) {
        console.log('Login error:', error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        })
    }
}

// FORGOT PASSWORD FUNCTION
const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is required" 
            })
        }
        
        // 1. Find user
        const user = await Usermodel.findOne({ email })
        
        if (!user) {
            // Don't tell user if email exists or not (security)
            return res.status(200).json({ 
                success: true, 
                message: "If email exists, reset instructions will be sent" 
            })
        }
   
        // 2. Generate reset token
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
        
        // 3. Save token to database (expires in 1 hour)
        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000 // 1 hour
        await user.save()
        
        // 4. Send email (you'll need to create this function)
        await sendResetPasswordEmail(user.email, resetToken)
        
        return res.status(200).json({
            success: true,
            message: "Reset instructions sent to email"
        })
        
    } catch (error) {
        console.log('Forgot password error:', error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        })
    }
}

// Verify Reset OTP
const VerifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      })
    }
    
    // Find user and check OTP
    const user = await Usermodel.findOne({ 
      email,
      resetPasswordToken: otp,
      resetPasswordExpiresAt: { $gt: Date.now() }
    })
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      })
    }
    
    // OTP is valid
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: otp // Return token for reset
    })
    
  } catch (error) {
    console.log('Verify OTP error:', error)
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    })
  }
}
// RESET PASSWORD FUNCTION
const ResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
        
        if (!token || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Token and new password are required" 
            })
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 6 characters" 
            })
        }
        
        // 1. Find user by token and check expiry
        const user = await Usermodel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired token" 
            })
        }
        
        // 2. Hash new password
        const hashedPassword = await bcryptjs.hashSync(newPassword, 10)
        
        // 3. Update password and clear reset token
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined
        await user.save()
        
        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })
        
    } catch (error) {
        console.log('Reset password error:', error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        })
    }
}
const Logout = (req, res) => {
  try {
    // agar cookie based auth hai
    res.clearCookie("token"); // cookie ka naam jo tum use kar rahi ho

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};


// Export all functions
export {checkLogin, Reigster, VerfiyEmail, Login, ForgotPassword, ResetPassword, VerifyResetOTP ,Logout}