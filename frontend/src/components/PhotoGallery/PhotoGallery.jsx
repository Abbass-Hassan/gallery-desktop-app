import React, { useEffect, useState } from "react";
import AddPhotoModal from "../AddPhotoModal/AddPhotoModal";
import PhotoItem from "../PhotoItem/PhotoItem"; // Import the new component
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

  // Fetch images when the component mounts.
  useEffect(() => {
    fetchUserImages();
  }, []);

  // This function is called when a file is selected from the Add Photo modal.
  const handleFileSelected = async (file) => {
    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const typedArray = new Uint8Array(arrayBuffer);

      try {
        const newPath = await window.electronAPI.saveFile(typedArray, fileName);
        const fileUrl = "file://" + newPath;
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

  // Handler for deleting a photo: delete from disk then update state.
  const handleDelete = async (photo) => {
    // Strip the "file://" prefix to get the raw file system path.
    const filePath = photo.url.replace(/^file:\/\//, "");
    try {
      await window.electronAPI.deleteFile(filePath);
      // Remove photo from state if deletion was successful.
      setPhotos((prevPhotos) => prevPhotos.filter((p) => p.id !== photo.id));
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  // Sample handler for editing a photo.
  const handleEdit = (photo) => {
    console.log("Edit photo:", photo);
    // Implement edit functionality here.
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
            <PhotoItem
              key={photo.id}
              photo={photo}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
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
