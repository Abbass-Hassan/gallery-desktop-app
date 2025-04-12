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

// Helper: Rotates an image data URL by a given angle (in degrees) and returns the new data URL.
async function rotateImage(dataUrl, angle) {
  const img = await createImage(dataUrl);
  const radians = (angle * Math.PI) / 180;
  let newWidth, newHeight;
  // Swap dimensions for 90° or 270° rotations.
  if (angle % 180 !== 0) {
    newWidth = img.height;
    newHeight = img.width;
  } else {
    newWidth = img.width;
    newHeight = img.height;
  }
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = newWidth;
  offscreenCanvas.height = newHeight;
  const ctx = offscreenCanvas.getContext("2d");
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return offscreenCanvas.toDataURL("image/jpeg");
}

const EditPhotoModal = ({ photo, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0); // Rotation angle in degrees

  // When the modal opens, load the image and draw it on the canvas.
  useEffect(() => {
    const img = new Image();
    img.src = photo.url;
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setCurrentImage(photo.url);
      setRotation(0); // Reset rotation state.
    };
  }, [photo.url]);

  // Called whenever the user finishes moving or resizing the crop area.
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Apply the crop and update the canvas.
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setIsCropping(false);
        setCurrentImage(croppedImageDataUrl);
        setRotation(0); // Reset rotation after crop.
      };
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  };

  // Rotate the current image by 90° increments.
  const handleRotate = async () => {
    try {
      const newRotation = (rotation + 90) % 360;
      const rotatedDataUrl = await rotateImage(currentImage, 90);
      const canvas = canvasRef.current;
      const img = new Image();
      img.src = rotatedDataUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setCurrentImage(rotatedDataUrl);
        setRotation(newRotation);
      };
    } catch (error) {
      console.error("Error rotating image:", error);
    }
  };

  // Convert the image on the canvas to Black & White.
  const handleBW = async () => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      // Create an offscreen canvas with the same dimensions.
      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext("2d");
      // Apply the grayscale filter.
      offCtx.filter = "grayscale(100%)";
      offCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      // Get the new data URL.
      const bwDataUrl = offscreen.toDataURL("image/jpeg");
      // Update the main canvas.
      const img = new Image();
      img.src = bwDataUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setCurrentImage(bwDataUrl);
      };
    } catch (error) {
      console.error("Error converting image to B&W:", error);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <h3>Edit Photo</h3>
        <div className="edit-image-container">
          {/* Always render the canvas */}
          <canvas ref={canvasRef} className="edit-canvas" />
          {/* Overlay cropper if in cropping mode */}
          {isCropping && currentImage && (
            <div className="cropper-container">
              <Cropper
                image={currentImage}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                // No fixed aspect; free-form cropping.
              />
            </div>
          )}
        </div>
        <div className="edit-controls">
          {/* Toggle crop mode */}
          {!isCropping ? (
            <button onClick={() => setIsCropping(true)}>Crop</button>
          ) : (
            <button onClick={applyCrop}>Apply Crop</button>
          )}
          {/* Rotate the image */}
          <button onClick={handleRotate}>Rotate</button>
          {/* Convert to Black & White */}
          <button onClick={handleBW}>B&W</button>
          {/* Placeholders for watermark feature */}
          <button
            onClick={() => {
              /* Implement watermark later */
            }}
          >
            Watermark
          </button>
        </div>
        <div className="edit-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            onClick={() => {
              // When finalized, retrieve the edited data from the canvas.
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
