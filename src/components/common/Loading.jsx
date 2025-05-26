import React from 'react'
import './Loading.css'
export default function Loading() {
  return (
    <div className='loading-layout'>
      <div className="logo-container">
        <img src="/Sonify-logo.png" alt="logo" />
      </div>
      <p>Loading resource...</p>
    </div>
  )
}
