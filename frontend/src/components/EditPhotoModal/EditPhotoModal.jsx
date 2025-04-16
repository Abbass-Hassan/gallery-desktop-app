import React, { useRef, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import "./EditPhotoModal.css";

// Creates an Image object from a URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });

// Generates cropped image from source and crop area
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

// Rotates image by specified angle
async function rotateImage(dataUrl, angle) {
  const img = await createImage(dataUrl);
  const radians = (angle * Math.PI) / 180;
  let newWidth, newHeight;

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
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0);

  // Initialize canvas with original image
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
      setRotation(0);
    };
  }, [photo.url]);

  // Store crop dimensions
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Process and apply crop
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
        setRotation(0);
      };
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  };

  // Rotate image 90 degrees
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

  // Apply grayscale filter
  const handleBW = async () => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext("2d");
      offCtx.filter = "grayscale(100%)";
      offCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      const bwDataUrl = offscreen.toDataURL("image/jpeg");
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

  // Add text watermark to image
  const applyWatermark = () => {
    if (!watermarkText) {
      alert("Please enter some text for the watermark.");
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.font = "80px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    const padding = 20;
    ctx.fillText(
      watermarkText,
      canvas.width - padding,
      canvas.height - padding
    );
    ctx.restore();
    const watermarkedDataUrl = canvas.toDataURL("image/jpeg");
    setCurrentImage(watermarkedDataUrl);
    setIsWatermarking(false);
    setWatermarkText("");
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">Edit Photo</h2>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="edit-image-container">
          <canvas ref={canvasRef} className="edit-canvas" />
          {isCropping && currentImage && (
            <div className="cropper-container">
              <Cropper
                image={currentImage}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
              />
            </div>
          )}
        </div>
        <div className="edit-controls">
          {!isCropping ? (
            <button
              className="control-button"
              onClick={() => setIsCropping(true)}
            >
              Crop
            </button>
          ) : (
            <button className="control-button" onClick={applyCrop}>
              Apply Crop
            </button>
          )}
          <button className="control-button" onClick={handleRotate}>
            Rotate
          </button>
          <button className="control-button" onClick={handleBW}>
            B&W
          </button>
          {!isWatermarking ? (
            <button
              className="control-button"
              onClick={() => setIsWatermarking(true)}
            >
              Watermark
            </button>
          ) : (
            <div className="watermark-actions">
              <input
                type="text"
                placeholder="Enter watermark text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />
              <button className="apply-watermark-btn" onClick={applyWatermark}>
                Apply Watermark
              </button>
              <button
                className="cancel-watermark-btn"
                onClick={() => {
                  setIsWatermarking(false);
                  setWatermarkText("");
                }}
              >
                Cancel Watermark
              </button>
            </div>
          )}
        </div>
        <div className="edit-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="apply-button"
            onClick={() => {
              const canvas = canvasRef.current;
              const editedDataUrl = canvas.toDataURL("image/jpeg");
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
