import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const transporter = nodemailer.createTransport({
  host:  process.env.EMAIL_HOST ,
  port: process.env.EMAIL_PORT ,
  secure: false, // true for port 465, false for other ports
  auth: {
    user:  process.env.EMAIL_USER,
    pass:  process.env.EMAIL_PASS,
  },
});


// const SendEmail= async()=>{
//   try {
//     const info= await transporter.sendMail({
//       from : '"Online Exam" <patleprajju@gmail.com>',
//       // to : "romanr9584@gmail.com",
//       to: email,
//       subject :"Hello Students !!",
//       text :"Welcome to Online Exam System",
//       html :"<b>Welcome to Online Exam System</b>"
//     })
//     console.log("Message sent : %s",info.messageId)
//   }
//   catch (error) {
//     console.log("Error occured while sending email",error)
//   }
// }


// SendEmail()
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email server connection failed:', error)
  } else {
    console.log('✅ Email server is ready to send messages')
    console.log('📧 Using email:', process.env.EMAIL_USER)
  }
})