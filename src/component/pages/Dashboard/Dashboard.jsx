import React, { createContext, useContext, useState } from 'react'
import Aside_Dashboard from './Aside_Dashboard'
import HomeDashboard from './Home Dashboard/HomeDashboard'
import './Dashboard.css'
// set context
export const ThemeContext = createContext()
export default function Dashboard() {
  const [styleContent, setStyleContent] = useState()
  return (
    <ThemeContext.Provider value={{ styleContent, setStyleContent }}>
      <div className='dashboard-container'>
        <div className="asidedb-container">
          <Aside_Dashboard userType={'admin'} />
        </div>
        <div className="contentdb-container">
          {styleContent}
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
