import React, { createContext, useContext, useEffect, useState } from 'react'
import Aside_Dashboard from './Aside_Dashboard'
import HomeDashboard from './Home Dashboard/HomeDashboard'
import './Dashboard.css'
import authApi from '../../../api/authenticationAPI'
import { useAuth } from '../../../utils/AuthenticationUtils'
import { useNavigate } from 'react-router-dom'
import Loading from '../../../components/common/Loading'
// set context
export const ThemeContext = createContext()
export default function Dashboard() {
  const navigate = useNavigate()
  const [styleContent, setStyleContent] = useState(<HomeDashboard />)
  const [tableTags, setTableTags] = useState([])
  const [typeName, setTypeName] = useState('')
  const { token, user, isLoading } = useAuth()
  useEffect(() => {
    if (!token) {
      return null
    }
    if (!token || token === 'null') {
      navigate('/login');
      return;
    }
  }, [token, user])
  // console.log(token)
  if (isLoading || !user) {
    return (
      <Loading />
    )
  }
  return (
    <ThemeContext.Provider value={{ styleContent, setStyleContent, tableTags, setTableTags, typeName, setTypeName }}>
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
