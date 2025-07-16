import React, { useEffect, useState } from 'react'
import './ModalAddContent.css'
import MusicAPI from '../../../../api/musicAPI';
import { useAuth } from '../../../../utils/AuthenticationUtils';
import GenreAPI from '../../../../api/GenreAPI';
import DataLoading from '../../../../components/common/DataLoading';
export default function ModalAddContent({ openclose }) {
    const { token } = useAuth()
    const [tagsModal, setTagsModal] = useState(false)
    const [collaboratorInput, setCollaboratorInput] = useState({
        name: '',
        user_id: '',
        role: ''
    });
    const [tagsSelection, setTagsSelection] = useState([{
        _id: '',
        name: ''
    }])
    const [dataContent, setDataContent] = useState({
        cover_image: '',
        title: '',
        description: '',
        genre: [],
        collaborators: [],
        music_file: '',
    })
    const [previewCoverImage, setPreviewCoverImage] = useState(null)
    const [isLoading,setIsLoading]=useState(false)
    // On Change Data
    const onChangeData = (e) => {
        const { id, files, type, value } = e.target
        if (type === 'file') {
            setDataContent(pre => ({
                ...pre,
                [id]: files[0] // lấy file đầu tiên
            }));
            if (id === 'cover_image') {
                setPreviewCoverImage(URL.createObjectURL(files[0]))
            }
        } else {
            setDataContent(pre => ({
                ...pre,
                [id]: value
            }));
        }
    }
    // tags
    const onChangeTags = (id, tags) => {
        const checkTags = dataContent.genre.some(item => item.id === id)
        if (checkTags) {
            setDataContent(pre => ({
                ...pre,
                genre: pre.genre.filter(item => item.id !== id)
            }))
        } else {
            setDataContent(pre => ({
                ...pre,
                genre: [...pre.genre, { id, tags }]
            }))
        }
    }
    const openTagsModal = () => {
        setTagsModal(pre => !pre)
    }

    // collaborator
    const handleCollaborator = (e) => {
        e.preventDefault()
        const { name, role, user_id } = collaboratorInput
        if (!name.trim()) {
            alert('need name')
            return;
        }
        let AlreadyExist = false
        if (!user_id.trim()) {
            AlreadyExist = dataContent.collaborators.some(item => item.name.toLowerCase() === name.toLowerCase())
        } else if (user_id.trim()) {
            AlreadyExist = dataContent.collaborators.some(item => item.name.toLowerCase() === name.toLowerCase() || item.user_id.toLowerCase() === user_id.toLowerCase())

        }
        if (AlreadyExist) {
            alert('Already exist name/User id')
            return;
        }
        setDataContent(pre => ({
            ...pre,
            collaborators: [...pre.collaborators, { name: name.trim(), user_id: user_id.trim(), role: role.trim() }]
        }))
        setCollaboratorInput({ name: '', user_id: '', role: '' })
    }

    const removeCollaborator = (index) => {
        setDataContent(pre => ({
            ...pre,
            collaborators: pre.collaborators.filter((_, i) => i !== index)
        }))
    }
    // API
    const uploadMusic = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            await MusicAPI.uploadMusic(dataContent, token)
            openclose()
            alert('success')
            setIsLoading(false)
        } catch (err) {
            console.error(err)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchGenre = async () => {
            const response = await GenreAPI.listGenres()
            setTagsSelection(response.data)
            // console.log(response)
        }
        fetchGenre()
    }, [])

    return (
        <div className='modal-addcontent-layout'>
            {isLoading ? <DataLoading/> : ''}
            <span onClick={openclose} className="exit">X</span>
            <form onSubmit={uploadMusic} className='modal-addcontent-container'>
                <div className="flex-modal">
                    <h3>Upload new content</h3>
                    <label className='upload-img' htmlFor="cover_image">{previewCoverImage ? <img src={previewCoverImage} alt="Cover Image" /> : 'Upload cover image'} </label>
                    <input type="file" accept='image/*' name="cover_image" id="cover_image" onChange={onChangeData} placeholder='Upload Cover Image' style={{ display: 'none' }} />
                    <div className="type-section">
                        <label htmlFor="title">Name</label>
                        <input type="text" id='title' placeholder='Name of your song' value={dataContent.title} onChange={onChangeData} />
                    </div>
                    <div className="type-section type-decription">
                        <label htmlFor="description">Descriptions</label>
                        <textarea id='description' placeholder='Description' value={dataContent.description} onChange={onChangeData} />
                    </div>
                    <div className="type-section" >
                        <label htmlFor="genre">Genre</label>
                        <input onClick={openTagsModal} type="text" id='genre' placeholder='Genre' value={dataContent.genre.map(item => item.tags).join(' ')} readOnly />
                        <div className="choose-modal">
                            {tagsModal ? tagsSelection.map((item) => {
                                return (
                                    <p key={item.id} onClick={() => onChangeTags(item._id, item.name)}>{item.name}</p>
                                )
                            }) : ''}
                        </div>
                    </div>
                    <div className="type-section">
                        <label htmlFor="collaborator">Collaborator</label>
                        <div className="collaborator-container">
                            <div className="collaborator-tags">
                                {dataContent.collaborators.map((collab, index) => {
                                    const hasAnyValue = collab.name || collab.role || collab.user_id;
                                    return hasAnyValue ? (
                                        <div className="collab-tag" key={index}>
                                            <span className="collab-text">
                                                {collab.name}
                                                {collab.role && ` / ${collab.role}`}
                                                {collab.user_id && ` (${collab.user_id})`}
                                            </span>
                                            <span className="collab-remove" onClick={() => removeCollaborator(index)}>×</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                            <input type="text" id='collaborators' placeholder='Name' value={collaboratorInput.name} onChange={(e) => setCollaboratorInput(pre => ({ ...pre, name: e.target.value }))} />
                            <p>More Detail (optional)</p>
                            <div className="detail-collaborators">
                                <div className="left-input">
                                    <input type="text" id='collaborators' placeholder='UserID (optional)' value={collaboratorInput.user_id} onChange={(e) => setCollaboratorInput(pre => ({ ...pre, user_id: e.target.value }))} />
                                    <input type="text" id='collaborators' placeholder='Role (optional)' value={collaboratorInput.role} onChange={(e) => setCollaboratorInput(pre => ({ ...pre, role: e.target.value }))} />
                                </div>
                                <button onClick={handleCollaborator}>Add</button>
                            </div>
                        </div>
                    </div>
                    <div className="type-section">
                        <label htmlFor="music_file">Music file (AAC)</label>
                        <label className='input-audio' htmlFor="music_file">{dataContent.music_file ? dataContent.music_file.name : 'Upload your music file here (ACC format) '} </label>
                        <input type="file" accept='audio/*' id='music_file' onChange={onChangeData} style={{ display: 'none' }} />
                    </div>
                    <p className='note'>For lyrics you can edit it later in Sonify Music Studio</p>
                </div>
                <button>Upload</button>
            </form>
        </div>
    )
}
