
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGigImageUpload } from '@/hooks/useGigImageUpload';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GigImageUploadProps {
  existingImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const GigImageUpload: React.FC<GigImageUploadProps> = ({
  existingImages,
  onImagesChange,
  maxImages = 5
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadGigImage, deleteGigImage } = useGigImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + images.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadGigImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      await deleteGigImage(imageUrl);
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(newImages);
      toast.success('Image removed successfully');
    } catch (error) {
      toast.error('Failed to remove image');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Gig Images ({images.length}/{maxImages})</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Add Images
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((imageUrl, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`Gig image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => handleRemoveImage(imageUrl, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {images.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 text-center mb-4">
                No images uploaded yet. Add images to showcase your gig.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Upload up to {maxImages} images. Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
      </p>
    </div>
  );
};

export default GigImageUpload;
