import React, { useState } from "react";
import "./PhotoItem.css";

const PhotoItem = ({ photo, onDelete, onEdit }) => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // Wrap delete in a confirmation.
  const confirmAndDelete = () => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      onDelete(photo);
    }
  };

  return (
    <div className="photo-item">
      <img src={photo.url} alt="Gallery item" className="photo-img" />
      <div className="photo-options">
        <button className="options-btn" onClick={toggleOptions}>
          &#8942;
        </button>
        {showOptions && (
          <div className="options-menu">
            <button onClick={() => onEdit(photo)}>Edit</button>
            <button onClick={confirmAndDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoItem;
