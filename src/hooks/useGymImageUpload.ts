
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGymImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, gymId: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${gymId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('gym-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[], gymId: string): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImage(file, gymId));
    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  };

  return {
    uploadImage,
    uploadMultipleImages,
    uploading
  };
};
