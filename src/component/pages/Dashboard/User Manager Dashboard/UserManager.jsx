import React from 'react'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import './UserManager.css'
export default function UserManager() {
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
      <div className="data-list-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Verication status</th>
              <th>Role</th>
              <th>Joined at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>YourName</td>
              <td>Something@mail.com</td>
              <td>Nope</td>
              <td>user</td>
              <td>30/4/1975</td>
              <td>Alive</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
