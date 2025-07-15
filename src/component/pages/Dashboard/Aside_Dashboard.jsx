import React, { useContext } from 'react'
import './Aside_Dashboard.css'
import ContentManager from './Content Managerment Dashboard/ContentManager'
import { ThemeContext } from './Dashboard'
import HomeDashboard from './Home Dashboard/HomeDashboard'
import UserManager from './User Manager Dashboard/UserManager'
import { useNavigate } from 'react-router'
export default function Aside_Dashboard({ userType }) {
  const {setStyleContent}=useContext(ThemeContext)
  const navigate=useNavigate()
  return (
    <div className="asidedb-layout">
      <div className="asidedb-logo">
        <img onClick={()=>navigate('/home')} src="/Sonify-logo.png" alt="logo" loading='lazy'/>
        <p className="user-name">{userType?.role == "admin" ? "Admin" : userType?.username}</p>
      </div>
      {userType?.role == 'admin' ?
        <div className="aisdedb-navigation-list">
          <p onClick={()=>setStyleContent(<HomeDashboard userType={userType}/>)}>Home</p>
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
          <p onClick={()=>setStyleContent(<HomeDashboard/>)}>Home</p>
          <p onClick={()=>setStyleContent(<ContentManager/>)}>Contents Managerment</p>
        </div>}
    </div>
  )
}
