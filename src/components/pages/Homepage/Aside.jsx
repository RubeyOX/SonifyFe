import React, { useState } from 'react'
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import FileDownloadDoneOutlinedIcon from '@mui/icons-material/FileDownloadDoneOutlined';
import AddIcon from '@mui/icons-material/Add';
import './Aside.css'
export default function Aside({ openInfo }) {
    const [isExpandAside, setIsExpandAside] = useState('')
    const [nameSelection, setNameSelection] = useState('')
    const [userInfo, setUserInfo] = useState({
        collection: ['Album', 'Collection', 'Download', 'My thing']
    })
    const ExpandAside = (status) => {
        if (isExpandAside == status) {
            setIsExpandAside('')
        } else {
            setIsExpandAside('expand-aside')
        }
    }
    return (
        <div className={`aside-collection ${isExpandAside}`}>
            {isExpandAside === 'expand-aside' ?
                <div className="expand-title">
                    <div className="collection-title-container">
                        <span className='left-title'>
                            <CollectionsBookmarkOutlinedIcon onClick={() => ExpandAside('expand-aside')} />
                            <b>Your Libary</b>
                        </span>
                        <AddIcon />
                    </div>
                    <div className="name-collection-container">
                        {userInfo.collection.map((item, index) => {
                            return (
                                <span onClick={() => setNameSelection(item)} className={`name-collection ${nameSelection == item ? 'selected' : ''}`} key={index}>{item}</span>
                            )
                        })}
                    </div>
                    <div className="music-list-container">
                        <div onClick={() => openInfo('open-aside')} className="music-item">
                            <div className="left-music-item">
                                <div className="cover-container">
                                    <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
                                </div>
                                <div className="detail-music-item">
                                    <b className="name-music">EP music cover</b>
                                    <p className="musician-name">Mer, Ngo</p>
                                </div>
                            </div>
                            <FileDownloadDoneOutlinedIcon />
                        </div>
                    </div>
                </div> :
                <div className="collapse-title">
                    <div className="collection-title-container">
                        <CollectionsBookmarkOutlinedIcon onClick={() => ExpandAside('expand-aside')} />
                        <AddIcon />
                    </div>
                    <div className="music-list-container">
                        <img onClick={() => openInfo('open-aside')} src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
                    </div>
                </div>
            }
        </div>
    )
}
