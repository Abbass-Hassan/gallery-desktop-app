import React, { useState } from "react";
import "./PhotoGallery.css";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, { id: Date.now(), url: newPhotoUrl }]);
      setNewPhotoUrl("");
      setShowModal(false);
    }
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">Your Photos</h2>
        <button className="add-photo-button" onClick={() => setShowModal(true)}>
          Add Photo
        </button>
      </div>
      <div className="divider"></div>

      <div className="photos-grid">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <div className="photo-item" key={photo.id}>
              <img src={photo.url} alt="Gallery item" />
            </div>
          ))
        ) : (
          <div className="empty-gallery">
            <p>No photos yet. Click "Add Photo" to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add a New Photo</h3>
            <input
              type="text"
              placeholder="Enter photo URL"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="add-button" onClick={handleAddPhoto}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
