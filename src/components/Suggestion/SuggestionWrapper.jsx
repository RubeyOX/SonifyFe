import React from "react";

// import SuggestionBlock from "./SuggestionBlock";
//
// import SuggestionBlockTitle from "./SuggestionBlockTitle";

import "./SuggestionWrapper.css";

function SuggestionWrapper({ suggestionBlock, suggestionSlider }) {
  return (
    <div className="suggest-container">
      <div className="suggestion-block">{suggestionBlock}</div>
      <div className="suggestion-slider">
        <div className="title-suggest">
          <b className="title-text">Made for Something</b>
          <p className="show-more">Show more</p>
        </div>
        {suggestionSlider}</div>
      {/* <div className="right-suggest">
        <div className="title-suggest">
          <b className="title-text">Made for Something</b>
          <p className="show-more">Show more</p>
        </div>
        <div className="music-item-list">
          <CustomSlickSlider
            data={dataMadefor}
            slidetoShow={6}
            typeCarousel={"madefor"}
          />
        </div>
      </div> */}
    </div>
  );
}

export default SuggestionWrapper;
