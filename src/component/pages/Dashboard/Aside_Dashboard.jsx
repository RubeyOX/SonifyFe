import React, { useContext } from 'react'
import './Aside_Dashboard.css'
import ContentManager from './Content Managerment Dashboard/ContentManager'
import { ThemeContext } from './Dashboard'
import HomeDashboard from './Home Dashboard/HomeDashboard'
import UserManager from './User Manager Dashboard/UserManager'
export default function Aside_Dashboard({ userType }) {
  const {setStyleContent}=useContext(ThemeContext)
  return (
    <div className="asidedb-layout">
      <div className="asidedb-logo">
        <img src="/Sonify-logo.png" alt="logo" />
        <p className="user-name">Admin</p>
      </div>
      {userType == 'admin' ?
        <div className="aisdedb-navigation-list">
          <p onClick={()=>setStyleContent(<HomeDashboard/>)}>Home</p>
          <p onClick={()=>setStyleContent(<UserManager/>)}>Users Managerment</p>
          <p onClick={()=>setStyleContent(<ContentManager/>)}>Contents Managerment</p>
          <p onClick={()=>setStyleContent()}>Community Managerment</p>
          <p onClick={()=>setStyleContent()}>Streaming Resources Managerment</p>
          <p onClick={()=>setStyleContent()}>Paid partnership Managerment</p>
          <p onClick={()=>setStyleContent()}>Reports Managerment</p>
          <p onClick={()=>setStyleContent()}>Nofication center</p>
          <p onClick={()=>setStyleContent()}>Sever health</p>
        </div> :
        <div className="aisdedb-navigation-list">
          <p onClick={()=>setStyleContent(<ContentManager/>)}>Contents Managerment</p>
          <p onClick={()=>setStyleContent()}>Streaming resources Managerment</p>
          <p onClick={()=>setStyleContent()}>Reports Managerment</p>
          <p onClick={()=>setStyleContent()}>Nofication center</p>
        </div>}

    </div>
  )
}
