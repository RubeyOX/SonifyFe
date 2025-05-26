import React, { createContext, useContext, useEffect, useState } from 'react'
import Aside_Dashboard from './Aside_Dashboard'
import HomeDashboard from './Home Dashboard/HomeDashboard'
import './Dashboard.css'
import authApi from '../../../api/authenticationAPI'
import { useAuth } from '../../../utils/AuthenticationUtils'
import { useNavigate } from 'react-router-dom'
// set context
export const ThemeContext = createContext()
export default function Dashboard() {
  const navigate = useNavigate()
  const [styleContent, setStyleContent] = useState('')
  const [tableTags, setTableTags] = useState([])
  const { token, user } = useAuth()
  useEffect(() => {
    if (!token || token === 'null') {
      navigate('/login');
    }
    console.log(user)
    if (user.role == 'user') {
      navigate('/home')
    }
  }, [token])
  if (!token) {
    return null
  }
  return (
    <ThemeContext.Provider value={{ styleContent, setStyleContent, tableTags, setTableTags }}>
      <div className='dashboard-container'>
        <div className="asidedb-container">
          <Aside_Dashboard userType={user} />
        </div>
        <div className="contentdb-container">
          {styleContent}
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
