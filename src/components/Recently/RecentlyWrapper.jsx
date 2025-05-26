import React from "react";

import "./RecentlyWrapper.css"

function RecentlyWrapper({ children }) {
  return (
    <div className="recently-container">
      <p className="title-text">Recently played</p>
      <div className="RecentlyWrapper">
          {children}
      </div>
    </div>
  );
}

export default RecentlyWrapper;
