import React, { useEffect, useState } from "react";
import AddPhotoModal from "../AddPhotoModal/AddPhotoModal";
import "./PhotoGallery.css";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch images stored on disk from the local folder on the Desktop.
  const fetchUserImages = async () => {
    try {
      const imagePaths = await window.electronAPI.getUserImages();
      // Convert absolute paths to file:// URLs
      const images = imagePaths.map((imgPath, index) => ({
        id: Date.now() + index,
        url: "file://" + imgPath,
      }));
      setPhotos(images);
    } catch (error) {
      console.error("Error fetching user images:", error);
    }
  };

  // Fetch images when the component mounts
  useEffect(() => {
    fetchUserImages();
  }, []);

  // This function is called when a file is selected from the Add Photo modal.
  const handleFileSelected = async (file) => {
    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = async (e) => {
      // e.target.result is the ArrayBuffer of the file.
      const arrayBuffer = e.target.result;
      // Convert the ArrayBuffer into a Uint8Array.
      const typedArray = new Uint8Array(arrayBuffer);

      try {
        // Call the exposed API with the file data and fileName.
        const newPath = await window.electronAPI.saveFile(typedArray, fileName);
        const fileUrl = "file://" + newPath;
        // Update state to include the newly saved image.
        setPhotos((prevPhotos) => [
          ...prevPhotos,
          { id: Date.now(), url: fileUrl },
        ]);
      } catch (error) {
        console.error("Error saving file:", error);
      }
      setShowModal(false);
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      setShowModal(false);
    };

    reader.readAsArrayBuffer(file);
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
        <AddPhotoModal
          onClose={() => setShowModal(false)}
          onFileSelected={handleFileSelected}
        />
      )}
    </div>
  );
};

export default PhotoGallery;
