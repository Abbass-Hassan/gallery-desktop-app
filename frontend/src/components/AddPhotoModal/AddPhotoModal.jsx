import React, { useState } from "react";
import "./AddPhotoModal.css";

const AddPhotoModal = ({ onClose, onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add a New Photo</h3>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="add-button"
            onClick={handleConfirm}
            disabled={!selectedFile}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoModal;
