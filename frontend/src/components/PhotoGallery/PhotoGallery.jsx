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

  // Fetch images stored on disk from the local folder on the Desktop.
  const fetchUserImages = async () => {
    setIsLoading(true);
    try {
      const imagePaths = await window.electronAPI.getUserImages();
      // Append a cache-buster query parameter to force reload of updated images.
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

  // Fetch images when the component mounts.
  useEffect(() => {
    fetchUserImages();
  }, []);

  // Called when a file is selected from the Add Photo modal.
  const handleFileSelected = async (file) => {
    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const typedArray = new Uint8Array(arrayBuffer);

      try {
        await window.electronAPI.saveFile(typedArray, fileName);
        // Refresh photo list so that the new image is loaded with a cache buster.
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

  // Handler for deleting a photo:
  const handleDelete = async (photo) => {
    try {
      // Remove the "file://" prefix and any query parameter.
      const oldPath = photo.url.replace("file://", "").split("?")[0];
      // Delete the file from disk.
      await window.electronAPI.deleteFile(oldPath);
      // Re-fetch the photos to update both the UI and local state.
      await fetchUserImages();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete the photo. Please try again.");
    }
  };

  // Handler for editing a photo.
  const handleEdit = (photo) => {
    setEditingPhoto(photo);
  };

  // Overwrite the original file with the edited image and refresh the gallery.
  const handleSaveEdited = async (editedDataUrl) => {
    if (!editingPhoto) return;

    try {
      // Convert the edited data URL into a typed array.
      const base64Data = editedDataUrl.split(",")[1];
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Derive the original file path by stripping "file://" and any cache parameters.
      const oldPath = editingPhoto.url.replace("file://", "").split("?")[0];
      const fileName = oldPath.substring(oldPath.lastIndexOf("/") + 1);

      // Delete the old file.
      await window.electronAPI.deleteFile(oldPath);
      // Save the edited image with the same file name.
      await window.electronAPI.saveFile(bytes, fileName);
      // Re-fetch the photos to update the gallery.
      await fetchUserImages();
      // Close the edit modal.
      setEditingPhoto(null);
    } catch (error) {
      console.error("Error saving edited photo:", error);
      alert("Failed to save the edited photo. Please try again.");
    }
  };

  // Cancel editing.
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
