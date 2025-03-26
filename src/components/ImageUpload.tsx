import React, { useRef, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Admin.module.css';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (file: File | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteLogo = () => {
    setPreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.imageUpload}>
      <div className={styles.imagePreview}>
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              width={100}
              height={100}
              objectFit="cover"
            />
            <button 
              type="button" 
              className={styles.deleteLogoButton}
              onClick={handleDeleteLogo}
              title="Delete logo"
            >
              ×
            </button>
          </>
        ) : (
          <span>No image</span>
        )}
      </div>
      <button type="button" className={styles.uploadButton} onClick={handleClick}>
        {preview ? 'Change Image' : 'Upload Image'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.uploadInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload; 