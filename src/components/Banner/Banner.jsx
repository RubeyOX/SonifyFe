import React from "react";

import Placeholder from "../../../src/assets/images/SonifyBanner.png"

import RemoveIcon from '@mui/icons-material/Remove';

import "./Banner.css"

function Banner({BannerImg}) {
  return (
    <div className="banner-container">
      <img
        src={BannerImg ? BannerImg : Placeholder}
        alt="banner"
      />
      <div className="stop-show">
        <div className="choose-stop">
          <p>Don't show me again</p>
          <RemoveIcon />
        </div>
      </div>
    </div>
  );
}

export default Banner;
