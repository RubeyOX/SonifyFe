import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../Dashboard'
import SettingsIcon from '@mui/icons-material/Settings';
import './DataTable.css'
import { useAuth } from '../../../../utils/AuthenticationUtils';
import MusicAPI from '../../../../api/musicAPI';
import userAPI from '../../../../api/userAPI';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ModalEdit from '../Modal Edit/ModalEdit';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import DataLoading from '../../../../components/common/DataLoading';
export default function DataTable() {
    const iosRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    const { token, user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState({
        page: 1,
        maxPage: 0
    })
    const { tableTags, typeName } = useContext(ThemeContext)
    const [dataContent, setDataContent] = useState([{
        _id: '',
        content_type: '',
        title: '',
        genre: [],
        is_deleted: false,
        created_at: ''
    }])

    const [dataUser, setDataUser] = useState([{
        _id: '',
        username: '',
        email: '',
        is_email_verified: false,
        role: '',
        createdAt: ''
    }])
    const pickKeys = (obj, tagsKey) => {
        return tagsKey.reduce((value, key) => {
            value[key] = key in obj ? obj[key] : ''
            return value
        }, {})
    }
    const [dataSetting, setDataSetting] = useState(null)
    const [openSettingModal, setOpenSettingModal] = useState(false)

    const ListUserData = async ({ page = 1, sortBy = 'title', sortOrder = 'asc' } = {}, signal) => {
        if (!token) return;
        const offset = (page - 1) * 10
        setIsLoading(true)
        try {
            if (typeName == 'content' && user?.role == 'artist') {
                const response = await MusicAPI.listUserMusic({ limit: 10, offset, sortBy, sortOrder }, token, signal)
                let keyName = Object.keys(dataContent[0])
                const filterData = response.data.map(item => pickKeys(item, keyName))
                setDataContent(filterData)
                setIsLoading(false)
            } else if (typeName == 'content' && user?.role == 'admin') {
                const response = await MusicAPI.listMusic({ limit: 10, offset, sortBy, sortOrder }, token, signal)
                let keyName = Object.keys(dataContent[0])
                setCurrentPage((pre) => ({ ...pre, maxPage: response.maxPage }))
                const filterData = response.data.map(item => pickKeys(item, keyName))
                setDataContent(filterData)
                setIsLoading(false)
            } else if (typeName == 'user') {
                const response = await userAPI.listUser({ limit: 10, offset, sortBy, sortOrder }, token, signal)
                let keyName = Object.keys(dataUser[0])
                const filterData = response.map(item => pickKeys(item, keyName))
                setDataUser(filterData)
                setIsLoading(false)
            }
        } catch (err) {
            console.error(err)
        }
    }
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        ListUserData({ page: 1 }, signal)
        return () => {
            controller.abort()
        }
    }, [typeName])
    const onChangeSetting = (data) => {
        setDataSetting(data)
        changeStatusSettingModal()
    }
    const changeStatusSettingModal = () => {
        setOpenSettingModal(pre => !pre)
    }
    const changePage = async (type) => {
        switch (type) {
            case 'start':
                ListUserData({ page: 1 })
                break;
            case 'end':
                ListUserData({ page: currentPage.maxPage })
                break;
            case 'next':
                if (currentPage.page == currentPage.maxPage) {
                    return;
                }
                ListUserData({ page: currentPage.page + 1 })
                break;
            case 'previous':
                if (currentPage.page === 1) {
                    return;
                }
                ListUserData({ page: currentPage.page - 1 })
                break;
        }
    }
    return (
        <div className="data-list-wrapper">
            {isLoading ? <DataLoading /> :
                <>
                    <div className='data-list-container'>
                        <table>
                            <thead>
                                <tr>
                                    {tableTags.map((tags, index) => {
                                        return (
                                            <th key={index}>{tags}</th>)
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {typeName === 'content' ? (dataContent.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            {Object.keys(item).filter(key => key !== '_id').map((key, idx) => {
                                                return (
                                                    <td key={idx}>{(() => {
                                                        const value = item[key]
                                                        if (typeof value === 'boolean') {
                                                            return value ? "stop" : 'working'
                                                        }
                                                        if (typeof value === 'string' && iosRegex.test(value)) {
                                                            const date = new Date(value)
                                                            return date.toLocaleDateString()
                                                        }
                                                        return Array.isArray(value) ? value.map(tags => tags.name).join(', ') : String(value)
                                                    })()}</td>
                                                )
                                            })}
                                            <td key="action" className='setting' onClick={() => onChangeSetting(item)} ><SettingsIcon /></td>
                                        </tr>
                                    )
                                })) : (dataUser.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            {Object.keys(item).filter(key => key !== '_id').map((key, idx) => {
                                                return (
                                                    <td key={idx}>{(() => {
                                                        const value = item[key]
                                                        if (typeof value === 'boolean') {
                                                            return value ? <CheckIcon /> : <CloseIcon />
                                                        }
                                                        if (typeof value === 'string' && iosRegex.test(value)) {
                                                            const date = new Date(value).toLocaleDateString('vi-VN', { timeZone: 'UTC' })

                                                            return date
                                                        }
                                                        return String(value)
                                                    })()}</td>
                                                )
                                            })}
                                            <td key="action" className='setting' onClick={() => onChangeSetting(item)} ><SettingsIcon /></td>
                                        </tr>
                                    )
                                }))}
                            </tbody>
                        </table>
                        {openSettingModal ? <ModalEdit openclose={changeStatusSettingModal} data={dataSetting} /> : ''}
                    </div>
                    <div className="pagination">
                        <button onClick={() => changePage('start')} className="move-pagination"><SkipPreviousIcon /></button>
                        <button onClick={() => changePage('previous')} className="move-pagination"><ArrowBackIosIcon /></button>
                        <span>{currentPage.page}</span>
                        <button onClick={() => changePage('next')} className="move-pagination"><ArrowForwardIosIcon /></button>
                        <button onClick={() => changePage('end')} className="move-pagination"><SkipNextIcon /></button>
                    </div>
                </>
            }
        </div>
    )
}
