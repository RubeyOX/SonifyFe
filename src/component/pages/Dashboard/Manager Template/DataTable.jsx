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
export default function DataTable() {
    const iosRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    const { tableTags, typeName } = useContext(ThemeContext)
    const [dataContent, setDataContent] = useState([{
        _id:'',
        content_type: '',
        title: '',
        genre: [],
        is_deleted: false,
        created_at: ''
    }])
    
    const [dataUser,setDataUser]=useState([{
        _id:'',
        username: '',
        email: '',
        is_email_verified: false,
        role: '',
        createdAt: ''
    }])
    const { token, user } = useAuth()
    const pickKeys = (obj, tagsKey) => {
        return tagsKey.reduce((value, key) => {
            value[key] = key in obj ? obj[key] : ''
            return value
        }, {})
    }
    const [dataSetting,setDataSetting]=useState(null)
    const [openSettingModal,setOpenSettingModal]=useState(false)
    useEffect(() => {
        const ListUserData = async () => {
            if (!token) return;
            try {
                if (typeName == 'content' && user?.role == 'artist') {
                    const response = await MusicAPI.listUserMusic({}, token)
                    let keyName = Object.keys(dataContent[0])
                    const filterData = response.data.map(item => pickKeys(item, keyName))
                    setDataContent(filterData)

                } else if( typeName == 'content' && user?.role == 'admin'){
                    const response = await MusicAPI.listMusic({},token)
                    let keyName =Object.keys(dataContent[0])
                    const filterData= response.data.map(item=> pickKeys(item,keyName))
                    setDataContent(filterData)
                }else if (typeName == 'user') {
                    const response = await userAPI.listUser({}, token)
                    let keyName = Object.keys(dataUser[0])
                    const filterData = response.map(item => pickKeys(item, keyName))
                    setDataUser(filterData)
                }
            } catch (err) {
                console.error(err)
            }
        }
        ListUserData()
    }, [typeName])
    const onChangeSetting=(data)=>{
        setDataSetting(data)
        changeStatusSettingModal()
    }
    const changeStatusSettingModal=()=>{
        setOpenSettingModal(pre=>!pre)
    }
    return (
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
                                {Object.keys(item).filter(key=>key !== '_id').map((key, idx) => {
                                    return (                                        
                                        <td key={idx}>{(() => {
                                            const value=item[key]
                                            if (typeof value === 'boolean') {
                                                return value ? "stop" : 'working'
                                            }
                                            if (typeof value === 'string' && iosRegex.test(value)) {
                                                const date = new Date(value)
                                                return date.toLocaleDateString()
                                            }
                                            return Array.isArray(value) ? value.map(tags=>tags.name).join(', ') : String(value)
                                        })()}</td>
                                    )
                                })}
                                <td key="action" className='setting' onClick={()=>onChangeSetting(item)} ><SettingsIcon /></td>
                            </tr>
                        )
                    })) : (dataUser.map((item, index) => {
                        return (
                            <tr key={index}>
                                {Object.keys(item).filter(key=> key !== '_id').map((key, idx) => {
                                    return (
                                        <td key={idx}>{(() => {
                                            const value=item[key]
                                            if (typeof value === 'boolean') {                    
                                                return value ? <CloseIcon /> :<CheckIcon />
                                            }
                                            if (typeof value === 'string' && iosRegex.test(value)) {
                                                const date = new Date(value).toLocaleDateString('vi-VN', { timeZone: 'UTC' })

                                                return date
                                            }
                                            return String(value)
                                        })()}</td>
                                    )
                                })}
                                <td key="action" className='setting' onClick={()=>onChangeSetting(item)} ><SettingsIcon /></td>
                            </tr>
                        )
                    }))}
                </tbody>
            </table>
            {openSettingModal ? <ModalEdit openclose={changeStatusSettingModal} data={dataSetting}/> : ''}
        </div>
    )
}
