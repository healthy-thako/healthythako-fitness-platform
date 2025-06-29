
import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageUploaded,
  className = ""
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfileImage, uploading } = useFileUpload();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    try {
      const imageUrl = await uploadProfileImage(file, user.id);
      onImageUploaded(imageUrl);
      setPreview(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setPreview(null);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-32 h-32 mx-auto">
        {/* Image Display */}
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
          {preview || currentImage ? (
            <img
              src={preview || currentImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
              <Camera className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          type="button"
          size="sm"
          className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 shadow-lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>

        {/* Clear Preview Button */}
        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-0 right-0 rounded-full w-8 h-8 p-0"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Status */}
      {uploading && (
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">Uploading image...</p>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
