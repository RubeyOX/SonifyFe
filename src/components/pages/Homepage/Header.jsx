import React, { useState } from 'react'
import Diversity2Icon from '@mui/icons-material/Diversity2';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import './Header.css'
import Profile from './Header_Modal/Profile';
import { useAuth } from '../../../utils/AuthenticationUtils';
import authApi from '../../../api/authenticationAPI';

export default function Header() {
  const navigate = useNavigate()
  const [openProfile,setOpenProfile]=useState(true)
  const [expandFind, setExpandFind] = useState('')
  const changeStatusFind = (status) => {
    if (expandFind !== status) {
      setExpandFind(status)
    } else (
      setExpandFind('')
    )
  }
  const { setToken, token: authToken } = useAuth();
  const logout = async()=>{
    try {
      // let s = await authApi.logout(authToken);
      // console.log("Logout response: ", s);
      // if(s.success){
        setToken(null);
        console.log("Logout success.");
        navigate("/login");
      // }else{
        // console.log("Logout failed.");
        // console.log(authToken);
      // }      
    } catch (e) {
      console.log("Error: ", e);
    }
  }
  return (
    <div className='header-layout'>
      <div className="header-container">
        <img onClick={() => navigate('/home')} src="/Sonify-logo.png" alt="logo" />
        <div className="find-music">
          <div className="left-find-section"><SearchOutlinedIcon />
            <input type="text" placeholder=' What do you want to play' />
          </div>
          <span className='right-find-random'> <span className="material-symbols-outlined">
            ifl
          </span></span>
        </div>
        <span className='user-logo-container'>
          <div className="user-logo-layout">
            <div className="search-expand" onClick={() => changeStatusFind('expand-find')}>
              <SearchOutlinedIcon />
            </div>
            <Diversity2Icon />
            <NotificationsNoneIcon />
            <div className='user-logo'><AccountCircleOutlinedIcon />
              <div className="account-menu-container">
                <p>Account Center</p>
                <p onClick={()=>setOpenProfile('open-modal')}>Profile</p>
                <p>Support</p>
                <p>Settings</p>
                <div className="line"></div>
                <p onClick={()=>{logout()}}>Log Out</p>
              </div>
            </div>
          </div>
        </span>
        <div className={`expand-find-container ${expandFind}`}>
          <div className="find-music">
            <div className="left-find-section"><SearchOutlinedIcon />
              <input type="text" placeholder=' What do you want to play' />
            </div>
            <span className='right-find-random'> <span className="material-symbols-outlined">
              ifl
            </span></span>
          </div>
        </div>
      </div>
      <div className={`profile-modal ${openProfile}`}>
          <Profile closeModal={setOpenProfile}/>
      </div>
    </div>
  )
}
