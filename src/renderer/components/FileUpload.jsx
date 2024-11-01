import React, { useState, useRef } from 'react';
import { fileService } from '../services/fileService';

export function FileUpload({ clientId, onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await fileService.uploadFile(file, clientId);
      if (onUploadComplete) onUploadComplete();
      fileInputRef.current.value = '';
    } catch (error) {
      setError('Error uploading file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4 ">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isUploading ? 'Carregando...' : 'Carregar Arquivo'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
