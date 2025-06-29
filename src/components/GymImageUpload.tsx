
import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGymImageUpload } from '@/hooks/useGymImageUpload';

interface GymImageUploadProps {
  currentImages: string[];
  featuredImage?: string;
  onImagesUpdated: (images: string[]) => void;
  onFeaturedImageSet: (imageUrl: string) => void;
  gymId: string;
  maxImages?: number;
}

const GymImageUpload: React.FC<GymImageUploadProps> = ({
  currentImages,
  featuredImage,
  onImagesUpdated,
  onFeaturedImageSet,
  gymId,
  maxImages = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useGymImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (currentImages.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file, gymId));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      const newImages = [...currentImages, ...validUrls];
      
      onImagesUpdated(newImages);
      
      // Set first uploaded image as featured if no featured image exists
      if (!featuredImage && validUrls.length > 0) {
        onFeaturedImageSet(validUrls[0]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    const newImages = currentImages.filter(url => url !== imageUrl);
    onImagesUpdated(newImages);
    
    // If removed image was featured, set new featured image
    if (imageUrl === featuredImage && newImages.length > 0) {
      onFeaturedImageSet(newImages[0]);
    }
  };

  const handleSetFeatured = (imageUrl: string) => {
    onFeaturedImageSet(imageUrl);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || currentImages.length >= maxImages}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Images ({currentImages.length}/{maxImages})
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={imageUrl}
                alt={`Gym image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              
              {/* Featured Badge */}
              {imageUrl === featuredImage && (
                <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {imageUrl !== featuredImage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetFeatured(imageUrl)}
                    className="text-xs"
                  >
                    Set Featured
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage(imageUrl)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area when no images */}
      {currentImages.length === 0 && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Add Gym Photos
          </h4>
          <p className="text-gray-600 mb-4">
            Upload photos to showcase your gym facilities
          </p>
          <Button type="button" variant="outline" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GymImageUpload;
