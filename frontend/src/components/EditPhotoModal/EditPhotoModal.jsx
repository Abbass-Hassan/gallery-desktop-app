import React, { useRef, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import "./EditPhotoModal.css";

// Helper: Creates an Image object from a URL.
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });

// Helper: Returns a cropped image data URL from the image source and crop area.
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL("image/jpeg");
}

const EditPhotoModal = ({ photo, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // When the modal opens, load the image and draw it to the canvas.
  useEffect(() => {
    const img = new Image();
    img.src = photo.url;
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      setCurrentImage(photo.url);
    };
  }, [photo.url]);

  // Update cropped area details.
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Apply the crop: generate a new image from the selected area and redraw the canvas.
  const applyCrop = async () => {
    try {
      const croppedImageDataUrl = await getCroppedImg(
        currentImage,
        croppedAreaPixels
      );
      const canvas = canvasRef.current;
      const img = new Image();
      img.src = croppedImageDataUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        setIsCropping(false);
        setCurrentImage(croppedImageDataUrl);
      };
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <h3>Edit Photo</h3>
        <div className="edit-image-container">
          {/* Always render the canvas so its ref remains available */}
          <canvas ref={canvasRef} className="edit-canvas" />
          {/* Overlay the Cropper when in cropping mode */}
          {isCropping && currentImage && (
            <div className="cropper-container">
              <Cropper
                image={currentImage}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                // Removing the aspect prop for free-form cropping.
              />
            </div>
          )}
        </div>
        <div className="edit-controls">
          {/* Toggle cropping mode */}
          {!isCropping ? (
            <button onClick={() => setIsCropping(true)}>Crop</button>
          ) : (
            <button onClick={applyCrop}>Apply Crop</button>
          )}
          {/* Placeholder buttons for future editing features */}
          <button
            onClick={() => {
              /* Implement rotation later */
            }}
          >
            Rotate
          </button>
          <button
            onClick={() => {
              /* Implement watermark later */
            }}
          >
            Watermark
          </button>
          <button
            onClick={() => {
              /* Implement B&W later */
            }}
          >
            B&W
          </button>
        </div>
        <div className="edit-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            onClick={() => {
              // Always retrieve the edited image from the canvas.
              const canvas = canvasRef.current;
              const editedDataUrl = canvas.toDataURL();
              onSave(editedDataUrl);
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPhotoModal;
