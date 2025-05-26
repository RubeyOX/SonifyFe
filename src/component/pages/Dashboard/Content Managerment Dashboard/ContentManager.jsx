import React, { useContext, useEffect, useState } from 'react'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import './ContentManager.css'
import ModalAddContent from './ModalAddContent';
import DataTable from '../Manager Template/DataTable'
import { ThemeContext } from '../Dashboard';
export default function ContentManager() {
  const [dataContent, setDataContent] = useState([{
    content_type: 'Music',
    name: 'Something',
    genre: 'Chill',
    status: 'Normal',
    createAt: '15/24/2024'
  }])
  const {setTableTags}=useContext(ThemeContext)
  useEffect(()=>{
    setTableTags(['Content Type', 'Name', 'Genre', 'Status', 'Created at', 'Actions'])
  },[])

  const [openModal, setOpenModal] = useState(false)
  const changeStatusModal = () => {
    setOpenModal(prev => !prev)
  }
  return (
    <div className='content-manager-container'>
      <div className="content-manager-header">
        <h3>DASHBOARD - CONTENT MANAGER</h3>
        <span><NotificationsNoneIcon /></span>
      </div>
      <div className="filter-content-container">
        <h4>Filter content</h4>
        <div className="filter-option-container">
          <div className="left-filter">
            <button>Content types</button>
            <button>Publication status</button>
            <button>Genre</button>
          </div>
          <div className="right-filter">
            <div className="search-section">
              <span><SearchOutlinedIcon /></span>
              <input type="text" placeholder='Search for content' />
            </div>
            <span className='add-icon' onClick={changeStatusModal}><AddIcon /></span>
          </div>
        </div>
      </div>
      <DataTable/>
      {openModal ? <ModalAddContent openclose={changeStatusModal} /> : ''}
    </div>
  )
}
