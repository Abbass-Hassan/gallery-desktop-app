import React, { useEffect, useState } from "react";
import AddPhotoModal from "../AddPhotoModal/AddPhotoModal";
import PhotoItem from "../PhotoItem/PhotoItem";
import EditPhotoModal from "../EditPhotoModal/EditPhotoModal";
import "./PhotoGallery.css";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved images from desktop folder
  const fetchUserImages = async () => {
    setIsLoading(true);
    try {
      const imagePaths = await window.electronAPI.getUserImages();
      const images = imagePaths.map((imgPath, index) => ({
        id: Date.now() + index,
        url: "file://" + imgPath + "?t=" + new Date().getTime(),
      }));
      setPhotos(images);
    } catch (error) {
      console.error("Error fetching user images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize gallery on component mount
  useEffect(() => {
    fetchUserImages();
  }, []);

  // Process newly selected image file
  const handleFileSelected = async (file) => {
    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const typedArray = new Uint8Array(arrayBuffer);

      try {
        await window.electronAPI.saveFile(typedArray, fileName);
        await fetchUserImages();
      } catch (error) {
        console.error("Error saving file:", error);
        alert("Failed to save the file. Please try again.");
      }
      setShowModal(false);
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Failed to read the file. Please try again.");
      setShowModal(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Remove image from storage and gallery
  const handleDelete = async (photo) => {
    try {
      const oldPath = photo.url.replace("file://", "").split("?")[0];
      await window.electronAPI.deleteFile(oldPath);
      await fetchUserImages();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete the photo. Please try again.");
    }
  };

  // Initiate photo editing flow
  const handleEdit = (photo) => {
    setEditingPhoto(photo);
  };

  // Save edited photo to disk
  const handleSaveEdited = async (editedDataUrl) => {
    if (!editingPhoto) return;

    try {
      // Convert data URL to binary
      const base64Data = editedDataUrl.split(",")[1];
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Extract file info and replace original
      const oldPath = editingPhoto.url.replace("file://", "").split("?")[0];
      const fileName = oldPath.substring(oldPath.lastIndexOf("/") + 1);

      await window.electronAPI.deleteFile(oldPath);
      await window.electronAPI.saveFile(bytes, fileName);
      await fetchUserImages();
      setEditingPhoto(null);
    } catch (error) {
      console.error("Error saving edited photo:", error);
      alert("Failed to save the edited photo. Please try again.");
    }
  };

  // Exit editing mode
  const handleCancelEditing = () => {
    setEditingPhoto(null);
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

      {isLoading ? (
        <div className="empty-gallery">
          <p>Loading your photos...</p>
        </div>
      ) : (
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
      )}

      {showModal && (
        <AddPhotoModal
          onClose={() => setShowModal(false)}
          onFileSelected={handleFileSelected}
        />
      )}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          onSave={handleSaveEdited}
          onCancel={handleCancelEditing}
        />
      )}
    </div>
  );
};

export default PhotoGallery;
