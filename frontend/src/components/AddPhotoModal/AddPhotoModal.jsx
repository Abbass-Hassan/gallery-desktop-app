import React, { useState } from "react";
import "./AddPhotoModal.css";

const AddPhotoModal = ({ onClose, onFileSelected }) => {
  // Local state to hold the file that the user picks
  const [selectedFile, setSelectedFile] = useState(null);

  // Update the state whenever a file is chosen
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Called when the user clicks the "Add" button
  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add a New Photo</h3>

        {/* File input to select an image */}
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="modal-buttons">
          {/* Cancel button closes the modal without saving */}
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>

          {/* Add button calls handleConfirm, which calls onFileSelected if a file is chosen */}
          <button
            className="add-button"
            onClick={handleConfirm}
            disabled={!selectedFile} // Disable "Add" if no file is selected
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoModal;
