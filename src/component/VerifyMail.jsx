import React from 'react'

export default function VerifyMail(props) {
  const typeVerify = props.type
  console.log(typeVerify)
  return (
    <div className='verifymail-layout'>
      <div className="logo-container">
        <img src="/Sonify-logo.png" alt="logo" />
      </div>
      {typeVerify == 'signup' ? <p>Thank you for joining our community!<br />
        We've sent you a verification email—please note it will expire in 1 hour.<br />
        Be sure to check your spam folder if you don't see it in your inbox!</p> :
        <p>
          We’ve emailed you a password recovery link, valid for 2 hours.<br/>
          Please check your inbox and spam folder.<br/>
          If you encounter any issues, feel free to contact our customer service team.
        </p>
      }
      <button>Resend Email <span>500</span></button>
      <p className='allright'>All rights reserved @ Snoify,2025</p>
    </div>
  )
}
