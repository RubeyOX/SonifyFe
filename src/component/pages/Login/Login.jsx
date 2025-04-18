import React from 'react'
import './Login.css'
import { ChevronRight } from 'lucide-react'
import {useNavigate} from 'react-router-dom'
export default function Login() {
  const navigate = useNavigate()
  return (
    <div className='login-layout'>
      <div className="login-container">
          <img src="/Sonify-logo.png" alt="logo" />
        <h1>Login to continue</h1>
        <form onSubmit={''} className='form-container'>
          <label htmlFor="email">Email address</label>
          <input type="text" id='email' placeholder='Email address' />
          <label htmlFor="password">Password</label>
          <input type="text" id='password' placeholder='Password' />
          <p onClick={()=>navigate('/forgot-pass')} className='forgot-pass'>Forgot Password?</p>
          <div className='or-container'>
            <span>OR</span>
          </div>
          <button className='login-with'>Login with Facebook</button>
          <button className='login-with'>Login with Google</button>
          <div className="remember-me-container">
            <label htmlFor='remember-me'>Remember Me</label>
            <input type="checkbox" id='remember-me' />
          </div>
          <button className='login'>Login</button>
          <div className="create-account">
            <p>Don't have an account?</p>
            <p onClick={()=>navigate('/signup')} className='create-one'>Create one <span><ChevronRight /></span></p>
          </div>
        </form>
      </div>
      <p className='allright'>All rights reserved @ Snoify,2025</p>
    </div>
  )
}
