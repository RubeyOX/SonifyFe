import React, { useState } from 'react'
import Diversity2Icon from '@mui/icons-material/Diversity2';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'; 
import { useNavigate } from 'react-router'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
export default function Header() {
  const navigate = useNavigate()
  const [expandFind, setExpandFind] = useState('')
  const changeStatusFind = (status) => {
    if (expandFind !== status) {
      setExpandFind(status)
    } else (
      setExpandFind('')
    )
  }
  return (
    <div className='header-layout'>
      <div className="header-container">
        <img onClick={() => navigate('/home')} src="/Sonify-logo.png" alt="logo" />
        <div className="find-music">
          <div className="left-find-section"><SearchOutlinedIcon />
            <input type="text" placeholder=' What do you want to play' />
          </div>
          <span className='right-find-random'> <span class="material-symbols-outlined">
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
            <span className='user-logo'><AccountCircleOutlinedIcon /></span>
          </div>
        </span>
        <div className={`expand-find-container ${expandFind}`}>
          <div className="find-music">
            <div className="left-find-section"><SearchOutlinedIcon />
              <input type="text" placeholder=' What do you want to play' />
            </div>
            <span className='right-find-random'> <span class="material-symbols-outlined">
              ifl
            </span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
