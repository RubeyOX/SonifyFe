import React from 'react'
import './Notfound.css'
import {useNavigate} from 'react-router-dom'
export default function NotFound() {
  const navigate=useNavigate()
  return (
    <div className='notfound-container'>
      <img src="/Sonify-logo.png" alt="logo" />
      <h1>404</h1>
      <div className="notfound-text">
        <h2>This page not exist</h2>
        <p>Maybe it has been deleted</p>
        <button onClick={()=>navigate('/home')}>Home</button>
      </div>
    </div>
  )
}
