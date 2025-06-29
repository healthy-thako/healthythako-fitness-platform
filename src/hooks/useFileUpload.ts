import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: 'profile-images' | 'gym-images'): Promise<string> => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (bucket: 'profile-images' | 'gym-images', filePath: string): Promise<void> => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  };

  return {
    uploadFile,
    uploadProfileImage,
    deleteFile,
    uploading
  };
};
