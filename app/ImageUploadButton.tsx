// ImageUploadButton.tsx
'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadButtonProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  buttonText?: string;
}

const ImageUploadButton = ({ 
  onImageSelect, 
  disabled = false,
  buttonText = "Upload Photo"
}: ImageUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    onImageSelect(file);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <Upload className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </>
  );
};

export default ImageUploadButton;