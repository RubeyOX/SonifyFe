import React, { useContext, useEffect } from 'react'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import './UserManager.css'
import { ThemeContext } from '../Dashboard';
import DataTable from '../Manager Template/DataTable';
import Cookies from 'js-cookie';
export default function UserManager() {
  const { setTableTags } = useContext(ThemeContext)
  useEffect(() => {
    setTableTags(['Username', 'Email', 'Verification status', 'Role', 'Joined at', 'Actions'])
  }, [])
  return (
    <div className='user-manager-container'>
      <div className="user-manager-header">
        <h3>DASHBOARD - USER MANAGER</h3>
        <span><NotificationsNoneIcon /></span>
      </div>
      <div className="filter-user-container">
        <h4>Filter content</h4>
        <div className="filter-option-container">
          <div className="left-filter">
            <button>User role</button>
            <button>Verification status</button>
          </div>
          <div className="right-filter">
            <div className="search-section">
              <span><SearchOutlinedIcon /></span>
              <input type="text" placeholder='Search for content' />
            </div>
          </div>
        </div>
      </div>
      <DataTable />
    </div>
  )
}
