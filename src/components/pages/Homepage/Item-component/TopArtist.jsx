import React, { useState } from 'react'
import './TopArtist.css'
import CustomSlickSlider from '../../../slider/CustomSlickSlider'
export default function TopArtist() {
  const [infoArtist, setInfoArtist] = useState([{
    id: '',
    avatar: 'https://i1.sndcdn.com/artworks-dpYHKm6svOv41CWl-fOxNrA-t500x500.jpg',
    name: 'Something',
    job: 'Record',
    topartist: [],
    playlists: []
  }])
  return (
    <CustomSlickSlider data={infoArtist} slidetoShow={4} typeCarousel={"topartist"} />
  )
}
