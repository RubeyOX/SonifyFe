import React from "react";

function SuggestionBlockTitle({artistName, artistCover}) {
  return (
    <div className="title-suggest">
      <img
        src={artistCover}
        alt="avt"
      />
      <div className="message-name">
        <p>New release from </p>
        <b className="title-text">{artistName}</b>
      </div>
    </div>
  );
}

export default SuggestionBlockTitle;
