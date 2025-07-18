// --- START OF FILE Header.jsx --- (Updated)
import React, { useState, useEffect, useRef } from 'react';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close'; // For clearing search
import './Header.css';
import Profile from './Header_Modal/Profile'; // Assuming this exists
import { useAuth } from '../../../utils/AuthenticationUtils';
// import authApi from '../../../api/authenticationAPI'; // No longer directly used here for logout

export default function Header({ onSearch }) { // Receive onSearch prop from Homepage
    const navigate = useNavigate();
    const [openProfileModal, setOpenProfileModal] = useState(false); // Changed state name
    const [expandFind, setExpandFind] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef(null);

    const { setToken: setAuthContextToken, token: authToken } = useAuth(); // Renamed to avoid conflict
    const changeStatusFind = (status) => {
        setExpandFind(prevStatus => prevStatus === status ? '' : status);
    };
    const handleLogout = async () => {
        try {
            // No need to call API here if useAuth handles token removal & redirect
            setAuthContextToken(null); // Clear token in AuthContext
            // localStorage.removeItem('authToken'); // Or however you persist token
            console.log("Logout initiated from Header.");
            navigate("/login");
        } catch (e) {
            console.log("Error during logout:", e);
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'click') { // Allow submit on click too if there's a button
            if (onSearch) {
                onSearch(searchQuery);
            }
            if (searchInputRef.current) searchInputRef.current.blur(); // Optionally blur input
            setExpandFind(''); // Close mobile search if open
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        if (onSearch) {
            onSearch(""); // Notify homepage to clear search results
        }
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    // Debounce search or search on submit
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length === 0 || searchQuery.length > 1) { // Search on empty or if more than 1 char
                // if (onSearch && searchQuery.trim() !== "") { // Uncomment for debounced search
                // onSearch(searchQuery);
                // }
            }
        }, 500); // 500ms debounce
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, onSearch]);


    return (
        <div className='header-layout'>
            <div className="header-container">
                <img onClick={() => { onSearch(""); navigate('/home'); }} src="/Sonify-logo.png" alt="logo" />
                <div className="find-music">
                    <div className="left-find-section">
                        <SearchOutlinedIcon onClick={handleSearchSubmit} style={{cursor: 'pointer'}}/>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder='What do you want to play?'
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            onKeyDown={handleSearchSubmit}
                        />
                        {searchQuery && (
                            <CloseIcon onClick={clearSearch} style={{ cursor: 'pointer', color: '#7F8080', marginLeft: '5px' }} />
                        )}
                    </div>
                    {/* Random find icon - functionality TBD
                    <span className='right-find-random'>
                        <span className="material-symbols-outlined">ifl</span>
                    </span>
                    */}
                </div>
                <span className='user-logo-container'>
                    <div className="user-logo-layout">
                        <div className="search-expand" onClick={() => changeStatusFind('expand-find')}>
                            <SearchOutlinedIcon />
                        </div>
                        {/* <Diversity2Icon /> */}
                        {/* <NotificationsNoneIcon /> */}
                        <div className='user-logo'>
                            <AccountCircleOutlinedIcon />
                            <div className="account-menu-container">
                                <p onClick={() => { /*navigate('/account-center')*/ }}>Account Center</p>
                                <p onClick={() => setOpenProfileModal(true)}>Profile</p>
                                <p onClick={() => { /*navigate('/support')*/ }}>Support</p>
                                <p onClick={() => { /*navigate('/settings')*/ }}>Settings</p>
                                <div className="line"></div>
                                {authToken ? <p onClick={handleLogout}>Log Out</p> : <p onClick={handleLogout}>Log In</p> }
                            </div>
                        </div>
                    </div>
                </span>
                <div className={`expand-find-container ${expandFind}`}>
                    <div className="find-music">
                        <div className="left-find-section">
                            <SearchOutlinedIcon onClick={handleSearchSubmit} style={{cursor: 'pointer'}} />
                            <input
                                type="text"
                                placeholder='What do you want to play'
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleSearchSubmit}
                            />
                            {searchQuery && (
                                <CloseIcon onClick={clearSearch} style={{ cursor: 'pointer', color: '#7F8080', marginLeft: '5px' }} />
                            )}
                        </div>
                        {/*
                        <span className='right-find-random'>
                            <span className="material-symbols-outlined">ifl</span>
                        </span>
                        */}
                    </div>
                </div>
            </div>
            {openProfileModal && (
                <div className="profile-modal-overlay"> {/* Add an overlay for better modal behavior */}
                    <Profile closeModal={() => setOpenProfileModal(false)} />
                </div>
            )}
        </div>
    );
}
// --- END OF FILE Header.jsx ---