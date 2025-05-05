import React, { useState } from 'react'
import './AlbumCollection.css'
import CustomSlickSlider from '../../../slider/CustomSlickSlider'
export default function AlbumCollection() {
    const [infoAlbum, setInfoCollection] = useState([{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },{
        id: '',
        cover_img: "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
        name: 'Something',
        music_list: [],
    },])
    return (
        <CustomSlickSlider data={infoAlbum} slidetoShow={4} typeCarousel={"playlists"} />
    )
}
