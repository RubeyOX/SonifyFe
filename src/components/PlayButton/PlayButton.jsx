import React from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PlayingAnimation from "../../assets/animations/Sonify_Playing_V2.lottie";
import "./PlayButton.css"
function PlayButton({ isPlaying, onclick=() => {
    console.log("play music button clicked!,")
} }) {
  return (
    <>
      {isPlaying ? (
        <div className="playing-icon" onClick={onclick}>
          <DotLottieReact src={PlayingAnimation} autoplay loop speed={0.7} />
        </div>
      ) : (
        <div className="play-icon" onClick={onclick}>
          <span className="play-btn">
            <PlayArrowIcon />
          </span>
        </div>
      )}
    </>
  );
}

export default PlayButton;
