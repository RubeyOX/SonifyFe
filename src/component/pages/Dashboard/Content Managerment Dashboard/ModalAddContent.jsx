import React, { useEffect, useState } from 'react'
import './ModalAddContent.css'
export default function ModalAddContent({ openclose }) {
    const [tagsModal, setTagsModal] = useState(false)
    const tagsSelection = [{
        id: '023',
        tags: 'something'
    }, {
        id: '013',
        tags: 'seching'
    }, {
        id: '0243',
        tags: 'lingching'
    }]
    const [dataContent, setDataContent] = useState({
        cover_image: '',
        name: '',
        description: '',
        genre: [{
            id: '',
            tags: ''
        },
        ],
        collaborators: '',
        music_file: '',
    })
    const [previewCoverImage, setPreviewCoverImage] = useState(null)
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
    // console.log('Cover Image:', dataContent.cover_image?.name || 'none');
    // console.log('Music File:', dataContent.music_file?.name || 'none');
    // console.log('Name:', dataContent.name);
    // console.log('Description:', dataContent.description);
    // console.log('Genre:', JSON.stringify(dataContent.genre));
    // console.log('Collaborators:', dataContent.collaborators);

    return (
        <div className='modal-addcontent-layout'>
            <span onClick={openclose} className="exit">X</span>
            <form action="" className='modal-addcontent-container'>
                <h3>Upload new content</h3>
                <label className='upload-img' htmlFor="cover_image">{previewCoverImage ? <img src={previewCoverImage} alt="Cover Image" /> : 'Upload cover image'} </label>
                <input type="file" accept='image/*' name="cover_image" id="cover_image" onChange={onChangeData} placeholder='Upload Cover Image' style={{ display: 'none' }} />
                <div className="type-section">
                    <label htmlFor="name">Upload new cover</label>
                    <input type="text" id='name' placeholder='Name of your song' value={dataContent.name} onChange={onChangeData} />
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
                                <p key={item.id} onClick={() => onChangeTags(item.id, item.tags)}>{item.tags}</p>
                            )
                        }) : ''}
                    </div>
                </div>
                <div className="type-section">
                    <label htmlFor="collaborator">Collaborator</label>
                    <input type="text" id='collaborators' placeholder='UserID/Name' value={dataContent.collaborators} onChange={onChangeData} />
                </div>
                <div className="type-section">
                    <label htmlFor="music_file">Music file (AAC)</label>
                    <label className='input-audio' htmlFor="music_file">{dataContent.music_file ? dataContent.music_file.name : 'Upload your music file here (ACC format) '} </label>
                    <input type="file" accept='audio/*' id='music_file' onChange={onChangeData} style={{ display: 'none' }} />
                </div>
                <p className='note'>For lyrics you can edit it later in Sonify Music Studio</p>
                <button>Upload</button>
            </form>
        </div>
    )
}
