import React from "react";

import SuggestionBlockTitle from "./SuggestionBlockTitle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import PlayButton from "../PlayButton/PlayButton";

function SuggestionBlock({
  image,
  artistName,
  following = false,
  title,
  detail,
}) {
  return (
    <>
      <SuggestionBlockTitle
        artistCover={
          "https://yt3.googleusercontent.com/uObQjocU6Yibic4p_ciOZ2PagdPjWKkVgldFT_kKeQnBnAjX2DQ8o_NfIc2NFh1ZA0nM_vE3Jgo=s160-c-k-c0x00ffffff-no-rj"
        }
        artistName={artistName}
      />
      <div className="suggestion-detail">
        <img src={image} alt="music cover" />
        <div className="info-music">
          <div className="info-section">
            <p className="name-musician">
              {artistName}
              {following ? " • following" : ""}
            </p>
            <b className="name-music title-text">{title}</b>
            <p className="detail-music">{detail}</p>
          </div>
         
          <div className="button-section">
            {<PlayButton/>}
            <span className="add-btn">
              <ControlPointIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default SuggestionBlock;
