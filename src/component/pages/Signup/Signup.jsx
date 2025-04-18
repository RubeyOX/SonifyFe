import { ChevronRight } from 'lucide-react'
import React from 'react'
import "./Signup.css"
import { useNavigate } from 'react-router-dom'
export default function Signup() {
  const navigate = useNavigate()
  return (
    <div className='signup-layout'>
      <div className="signup-container">
        <img src="/Sonify-logo.png" alt="logo" />
        <h1>Sign up</h1>
        <form onSubmit={''} className='form-container'>
          <label htmlFor="name">Your name</label>
          <input type="text" id='name' placeholder='Your name' />
          <label htmlFor="email">Email address</label>
          <input type="text" id='email' placeholder='Email address' />
          <label htmlFor="password">Password</label>
          <input type="text" id='password' placeholder='Password' />
          <p className='forgot-pass'>Forgot Password?</p>
          <div className='or-container'>
            <span>OR</span>
          </div>
          <button className='signup-with'>Signup with Facebook</button>
          <button className='signup-with'>Signup with Google</button>
          <div className="remember-me-container">
            <label htmlFor='remember-me'>Remember Me</label>
            <input type="checkbox" id='remember-me' />
          </div>
          <button className='signup'>Signup</button>
          <div className="create-account">
            <p>Already have an account?</p>
            <p onClick={() => navigate('/login')} className='create-one'>Log in <span><ChevronRight /></span></p>
          </div>
        </form>
      </div>
      <p className='allright'>All rights reserved @ Snoify,2025</p>
    </div>
  )
}
