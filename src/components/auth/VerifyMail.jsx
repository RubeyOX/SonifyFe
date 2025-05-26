import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './VerifyMail.css'
import authApi from '../../api/authenticationAPI'
export default function VerifyMail(props) {
  const typeVerify = props.type
  console.log(typeVerify)
  const {email} = useParams();
  useEffect(() => {
    if(localStorage.getItem('emailVerifyRequested') == 'true'){
      return;
    }else{
      localStorage.setItem('emailVerifyRequested', true);
    }
    console.log(email);
    authApi.requestVerification(email);
  },[])
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
      <button disabled>Resend Email <span>500</span></button>
      <p className='allright'>All rights reserved @ Snoify,2025</p>
    </div>
  )
}
