// src/components/PlayButton/AddToFavBtn.jsx (or your path)
import React from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // Not used in the provided snippet
// import PlayingAnimation from "../../assets/animations/Sonify_Playing_V2.lottie"; // Not used
import "./PlayButton.css"; // Assuming this contains styling for .addfav-icon, .addfav-btn

// This component will be used for "Add to Library" functionality.
// The `isFav` prop will represent `isInLibrary`.
function AddToFavBtn({
    isInLibraryState, // Changed prop name for clarity in this context
    onClickHandler = () => { // Renamed for clarity
        console.log("Add to Library button clicked!");
    }
}) {
  return (
    <>
      {/* If isInLibraryState is true, item is in library, show "added" style */}
      {/* If isInLibraryState is false, item is not in library, show "add" style */}
      <div className="addfav-icon" onClick={onClickHandler}>
        <span
            className="addfav-btn"
            style={{ color: isInLibraryState ? "var(--Graphic-variant)" : "inherit" }} // Use "inherit" or your default icon color
            title={isInLibraryState ? "In Library" : "Add to Library"}
        >
            <AddCircleOutlineIcon /> {/* Or use different icons for added/not added state */}
        </span>
      </div>
    </>
  );
}

export default AddToFavBtn;