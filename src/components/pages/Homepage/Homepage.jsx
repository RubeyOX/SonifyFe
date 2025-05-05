import Aside from "./Aside";
import "./Homepage.css";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { useEffect, useState } from "react";
import InfoAside from "./InfoAside";
import Audio from "./Audio";
import Header from "./Header";
import CustomSlickSlider from "../../slider/CustomSlickSlider";

import Banner from "../../Banner/Banner";

import RecentlyWrapper from "../../Recently/RecentlyWrapper";
import RecentlyBlock from "../../Recently/RecentlyBlock";

import SuggestionWrapper from "../../Suggestion/SuggestionWrapper";
import SuggestionBlock from "../../Suggestion/SuggestionBlock";

import ItemCarousel from "../../ItemCarousel/ItemCarousel";

import MusicItem from "../../Items/MusicItem";

import PlaylistItem from "../../Items/PlaylistItem";

export default function Homepage() {
  const [infoAside, setInfoAside] = useState("");
  const typeInfoAside = (type) => {
    if (type === "open-aside") {
      setInfoAside(type);
    } else {
      setInfoAside("");
    }
  };
  const [dataRecently, setDataRecently] = useState([
    {
      id: "01",
      music_cover:
        "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
      name: "Last month in yesdgsdgdsars",
    },
  ]);
  const [dataMadefor, setDataMadefor] = useState([
    {
      id: "01",
      collection_cover:
        "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
      name: "Morning",
      from: ["Something", "Sonify Records"],
      more: ["1", "543", "214", "4", "6"],
    },
    {
      id: "02",
      collection_cover:
        "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
      name: "Evening",
      from: ["Something", "Sonify Records"],
      more: ["1", "543", "214", "4", "6"],
    },
  ]);
  const [dataTopTrending, setDataTopTrending] = useState([
    {
      id: "01",
      music_cover:
        "https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg",
      name: "Last on the years",
      musician: "Something",
    },
    
  ]);
  return (
    <div className="homepage-container">
      <div className="header">
        <Header />
      </div>
      <div className="aside-collection-grid">
        <Aside openInfo={typeInfoAside} />
      </div>
      <div className="main-content">
        <Banner />
        <RecentlyWrapper>
          <RecentlyBlock
            id="SDA"
            musicCover="https://i1.sndcdn.com/artworks-dpYHKm6svOv41CWl-fOxNrA-t500x500.jpg"
            name="Test only...."
            playingRecently="A"
            key="ADS"
          />
          <RecentlyBlock
            id="aSDA"
            musicCover="https://i1.sndcdn.com/artworks-dpYHKm6svOv41CWl-fOxNrA-t500x500.jpg"
            name="Test only...."
            playingRecently="aSDA"
            key="ADaS"
          />
        </RecentlyWrapper>
        <SuggestionWrapper
          suggestionBlock={
            <SuggestionBlock
              artistName={"Quyếch"}
              title={"Lời nhắn"}
              detail={
                '"Lời Nhắn" của Quyếch là một bài hát sâu lắng, thể hiện những tâm tư và cảm xúc chân thật trong cuộc sống. Với giai điệu nhẹ nhàng và lời hát giàu ý nghĩa, bài hát như một lời tâm tình, chạm đến trái tim người nghe và tạo ra sự đồng cảm mạnh mẽ. Đây là một tác phẩm đáng...'
              }
              image={
                "https://th.bing.com/th/id/OIP.WgPDUDvQxktaBJWTa7GcywHaHa?cb=iwc1&rs=1&pid=ImgDetMain"
              }
              following={true}
              key={"acs"}
            />
          }
          suggestionSlider={
            <>
              <ItemCarousel>
                {
                  dataMadefor.map((item,ind)=>{
                    return(
                      <PlaylistItem
                        key={ind}
                        coverImage={item.collection_cover}
                        title={item.name}
                        contributors={item.from}
                        widthSize="180px"
                      />
                    )
                    
                  })
                }
                
              </ItemCarousel>
            </>
          }
        />
        <div className="trending-container">
          <div className="title-trending">
            <b className="title-text">Top Trending</b>
            <p className="show-more">Show more</p>
          </div>
          <div className="music-list-container">
              <ItemCarousel>
                {dataTopTrending.map((item, ind)=>{
                  return(
                    <MusicItem
                      coverImage={item.music_cover}
                      contributors={[item.musician]}
                      key={ind}
                      title={item.name}
                    />
                  )
                })}
              </ItemCarousel>
          </div>
        </div>
      </div>
      <div className={`info-aside-grid ${infoAside}`}>
        <InfoAside closeInfo={typeInfoAside} />
      </div>
      <div className="audio-grid">
        <Audio audioSrc="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      </div>
    </div>
  );
}
