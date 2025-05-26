import React from 'react'
import { useNavigate, useParams } from 'react-router'
import './Forgotpass.css'
import EastIcon from '@mui/icons-material/East';
export default function Forgotpass() {
  const email = useParams()
  console.log(email.id)
  const navigtate = useNavigate()
  return (
    <div className='changepass-layout'>
      {email.id ?
        <div className="changepass-container">
          <img src="/Sonify-logo.png" alt="logo" />
          <h1>
            Hi, Something<br />
            Please setup your new password:
          </h1>
          <form onSubmit={''}>
            <label htmlFor='password'>Password</label>
            <input type="text" id='password' placeholder='New Password' />
            <button>Sign up</button>
            <p onClick={() => navigtate('/login')}>Back to login <EastIcon /></p>
          </form>
        </div>
        :
        <div className="changepass-container">
          <img src="/Sonify-logo.png" alt="logo" />
          <h1>Forgot password</h1>
          <form onSubmit={''}>
            <label htmlFor='email'>Email address</label>
            <input type="text" id='email' placeholder='Your Email' />
            <button>Sign up</button>
            <p onClick={() => navigtate('/login')}>Back to login <EastIcon /></p>
          </form>
        </div>

      }
    </div>
  )
}
