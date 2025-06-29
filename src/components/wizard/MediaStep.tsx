import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGigImageUpload } from '@/hooks/useGigImageUpload';
import { Upload, X, Image, Camera, AlertTriangle } from 'lucide-react';
import { GigFormData } from '../CreateGigWizard';
import { toast } from 'sonner';

interface MediaStepProps {
  formData: GigFormData;
  updateFormData: (updates: Partial<GigFormData>) => void;
}

export const MediaStep: React.FC<MediaStepProps> = ({ formData, updateFormData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadGigImage, deleteGigImage, uploading } = useGigImageUpload();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const maxImages = 5;
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (formData.images.length + files.length > maxImages) {
      toast.error(`You can upload maximum ${maxImages} images`);
      return;
    }

    // Validate files
    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const uploadPromises = validFiles.map(file => uploadGigImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      updateFormData({
        images: [...formData.images, ...uploadedUrls]
      });
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error('Failed to upload images: ' + error.message);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      await deleteGigImage(imageUrl);
      updateFormData({
        images: formData.images.filter(url => url !== imageUrl)
      });
      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove image: ' + error.message);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    updateFormData({ images: newImages });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Media & Portfolio</h3>
        <p className="text-gray-600">Showcase your work with images (optional but recommended)</p>
      </div>

      {/* Upload Warning for Mobile */}
      <Card className="bg-amber-50 border-amber-200 sm:hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Mobile Upload Tip</p>
              <p>For best results, use your camera app to take photos first, then upload them here.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5" />
            Upload Gig Images ({formData.images.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer ${
              uploading 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={uploading || formData.images.length >= 5}
            />
            
            <Upload className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${uploading ? 'text-purple-600' : 'text-gray-400'}`} />
            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {uploading ? 'Uploading Images...' : 'Upload Gig Images'}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {formData.images.length >= 5 
                ? 'Maximum images reached' 
                : 'Drag and drop images here, or click to browse'
              }
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={uploading || formData.images.length >= 5}
              size="sm"
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              PNG, JPG, WEBP up to 10MB each. Maximum 5 images.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {formData.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Your Images ({formData.images.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {formData.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square w-full">
                    <img
                      src={imageUrl}
                      alt={`Gig image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imageUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Main image indicator */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                      Main
                    </div>
                  )}

                  {/* Move to front button (for non-main images) */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 0)}
                      className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      Make Main
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.images.length > 0 && (
              <p className="text-xs text-gray-500 mt-4">
                The first image will be your main gig image. Click "Make Main" to reorder images.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-3">📸 Image Guidelines</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-blue-800 mb-2">What to Include:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• High-quality, well-lit photos</li>
                <li>• Yourself training or demonstrating</li>
                <li>• Before/after transformations</li>
                <li>• Your equipment or gym setup</li>
                <li>• Certifications or achievements</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-blue-800 mb-2">Best Practices:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use natural lighting when possible</li>
                <li>• Keep images professional</li>
                <li>• Show variety in your services</li>
                <li>• First image should be your best</li>
                <li>• Avoid blurry or dark photos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Images Message */}
      {formData.images.length === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">No images uploaded yet</h4>
            <p className="text-sm text-gray-600 mb-4">
              While images are optional, gigs with photos get 3x more views and bookings.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              size="sm"
            >
              Upload Your First Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
