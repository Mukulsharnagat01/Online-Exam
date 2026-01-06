import express from 'express'
import { Reigster, VerfiyEmail ,Login, 
    ForgotPassword, 
    ResetPassword,VerifyResetOTP ,Logout,checkLogin  } from '../controllers/Auth.js'
// import { checkLogin } from "../controllers/Auth.js";
import authMiddleware from '../middlewares/authMiddleware.js'
const AuthRoutes=express.Router()


AuthRoutes.get('/check-login',authMiddleware, checkLogin);
AuthRoutes.post('/register',Reigster)
AuthRoutes.post('/verifyEmail',VerfiyEmail)
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgot-password', ForgotPassword);
AuthRoutes.post('/verify-reset-otp', VerifyResetOTP)
AuthRoutes.post('/reset-password', ResetPassword);

AuthRoutes.post('/logout', Logout); 


export default AuthRoutes;