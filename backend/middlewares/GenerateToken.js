import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookies=(res,user)=>{
    const token=jwt.sign(
        { userId: user._id,
      role: user.role, },

        process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    res.cookie('token',token,{
        httpOnly: true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:"Lax",
        maxAge:7 * 24 * 60 *60 * 1000,
        secure: false
    })
    return token
}