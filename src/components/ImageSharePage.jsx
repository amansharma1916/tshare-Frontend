import React, { useEffect, useState } from 'react';
import './ImageSharePage.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const ImageSharePage = () => {
  const [imageCode, setImageCode] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const onImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImageError('');
  };

  const uploadImage = () => {
    if (!imageFile) {
      setImageError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    setImageLoading(true);
    setImageError('');

    fetch(endpoints.uploadImage, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload image');
        }
        setImageCode(data.id);
      })
      .catch(error => {
        console.error('Error:', error);
        setImageError(error.message || 'Failed to upload image');
      })
      .finally(() => {
        setImageLoading(false);
      });
  };

  const copyImageCode = () => {
    if (!imageCode) return;

    navigator.clipboard.writeText(imageCode)
      .then(() => {
        setImageCopied(true);
        setTimeout(() => setImageCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div>
      <div className="nameBanner">
        {bannerText}
      </div>
      <div className="shareMain">
        <div className="imageBox">
          <div className="code">
            {imageCode ? (
              <>
                <h1>Image Code</h1>
                <div onClick={copyImageCode} className="codeBadge">
                  {imageCode} {imageCopied ? '✓' : '📋'}
                </div>
              </>
            ) : (
              <h1>Share an Image</h1>
            )}
          </div>

          <div className="imageUploadRow">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="imageInput"
            />
            {imageError && <div className="imageError">{imageError}</div>}
          </div>

          {imagePreview && (
            <div className="imagePreview">
              <img src={imagePreview} alt="Selected" />
            </div>
          )}

          <div className="buttons-container">
            <button
              className="Btn image-share-btn"
              onClick={uploadImage}
              disabled={imageLoading}
            >
              {imageLoading ? 'Sharing...' : 'Share Image'}
            </button>

            <button
              className="Btn secondaryBtn"
              onClick={() => { window.location.href = '/sharePage'; }}
            >
              Share Text
            </button>

            <button
              className="Btn secondaryBtn"
              onClick={() => { window.location.href = '/'; }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSharePage;
