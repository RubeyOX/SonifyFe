import React, { useContext, useEffect, useState } from 'react'
import './ModalEdit.css'
import { ThemeContext } from '../Dashboard'
import GenreAPI from '../../../../api/GenreAPI'
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../../utils/AuthenticationUtils';
import MusicAPI from '../../../../api/musicAPI';
import userAPI from '../../../../api/userAPI';
export default function ModalEdit({ data, openclose }) {
    const {token}=useAuth()
    const { tableTags, typeName } = useContext(ThemeContext)
    const [dataUser, setDataUser] = useState({
        _id: '',
        username: '',
        email: '',
        is_email_verified: false,
        role: '',
        createdAt: ''
    })
    const [dataContent, setDataContent] = useState({
        _id: '',
        content_type: '',
        title: '',
        genre: [],
        is_deleted: false,
        created_at: ''
    })
    const [tagsSelection, setTagsSelection] = useState([{
        _id: '',
        name: ''
    }])
    const [listOpen, setListOpen] = useState({
        genre: false,
        status: false,
        role: false,
    })
    const changeStatusList = (type) => {
        setListOpen(pre => ({ ...pre, [type]: !pre[type] }))
    }
    console.log(dataUser)
    useEffect(() => {
        if (typeName == 'content') {
            setDataContent(data)
        } else if (typeName == 'user') {
            setDataUser(data)
        }
        const fetchGenre = async () => {
            const response = await GenreAPI.listGenres()
            setTagsSelection(response.data)
        }
        fetchGenre()
    }, [typeName])
    const onChangeData = (e) => {
        const { id: key, value } = e.target
        if (typeName == 'content') {
            setDataContent(pre => ({
                ...pre,
                [key]: value
            }))
        } else if (typeName == 'user') {
            setDataUser(pre => ({
                ...pre,
                [key]: value
            }))
        }
    }
    const onChangeTags = (type, id, tags) => {
        if (type == 'genre') {
            const checkTags = dataContent.genre.some(item => item.id === id)
            if (checkTags) {
                setDataContent(pre => ({
                    ...pre,
                    genre: pre.genre.filter(item => item.id !== id)
                }))
            } else {
                setDataContent(pre => ({
                    ...pre,
                    genre: [...pre.genre, { _id: id, name: tags }]
                }))
            }
        } else if (type == 'role') {
            setDataUser(pre => ({
                ...pre,
                role: tags
            }))
        } else if (type == 'status') {
            setDataContent(pre => ({
                ...pre,
                is_deleted: tags
            }))
        }
    }
    const ChangeData = async (e) => {
        e.preventDefault()
        if(typeName=='user'){
            try{
                const response=await userAPI.changeUserDetailManager(dataUser,token)
                console.log(response)
                alert("Success change user data")
            }catch(err){
                console.error(err)
            }
        }else{
            try{
                const response=await MusicAPI.changeMusicDetailManager(dataContent,token) 
                alert("Success change music data")
                console.log(response)
            }catch(err){
                console.error(err)
            }
        }
    }
    return (
        <div className="modal-edit-layout">
            <form onSubmit={ChangeData} className="modal-edit-container">
                <div className="close" onClick={openclose}><span>X</span></div>
                <table>
                    <thead>
                        <tr>
                            {tableTags.map((tags, index) => {
                                if (tags == 'Actions') {
                                    return ''
                                }
                                return (
                                    <th key={index}>{tags}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {typeName == 'user' ? (
                                <>
                                    <td><input id='username' type="text" value={dataUser.username} onChange={onChangeData} /></td>
                                    <td><input id='email' type="text" value={dataUser.email} onChange={onChangeData} readOnly /></td>
                                    <td>{dataUser.is_email_verified ? <CloseIcon /> : <CheckIcon />}</td>
                                    <td className='choose-container' onClick={() => changeStatusList('role')}><span>{dataUser.role}</span>
                                        {listOpen.role ? (
                                            <div className="choose-list">
                                                <span onClick={() => onChangeTags('role', '', 'user')} >user</span>
                                                <span onClick={() => onChangeTags('role', '', 'artist')}>artist</span>
                                                <span onClick={() => onChangeTags('role', '', 'admin')}>admin</span>
                                            </div>
                                        ) : ''}
                                    </td>
                                    <td>{new Date(dataUser.createdAt).toLocaleDateString()}</td>
                                </>
                            ) : (
                                <>
                                    <td>{dataContent.content_type}</td>
                                    <td><input id='title' type="text" value={dataContent.title} onChange={onChangeData} /></td>
                                    <td className='choose-container' onClick={() => changeStatusList('genre')}><span>{dataContent.genre.map(tags => tags.name).join(', ')}</span>
                                        {listOpen.genre ? (
                                            <div className="choose-list">
                                                {tagsSelection.map((tags, index) => <span key={index} onClick={() => onChangeTags('genre', tags._id, tags.name)}>{tags.name}</span>)}
                                            </div>
                                        ) : ''}
                                    </td>
                                    <td className='choose-container'><span onClick={() => changeStatusList('status')}>{dataContent.is_deleted ? 'stop' : 'working'}</span>
                                        {listOpen.status ? (
                                            <div className="choose-list">
                                                <span onClick={() => onChangeTags('status', '', false)}>Working</span>
                                                <span onClick={() => onChangeTags('status', '', true)}>Stop</span>
                                            </div>
                                        ) : ''}
                                    </td>
                                    <td>{new Date(dataContent.created_at).toLocaleDateString()}</td>
                                </>
                            )}
                        </tr>
                    </tbody>
                </table>
                <button>Save Change</button>
            </form>
        </div>

    )
}
