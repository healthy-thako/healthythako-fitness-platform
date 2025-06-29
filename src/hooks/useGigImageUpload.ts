
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useGigImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadGigImage = async (file: File, gigId?: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${gigId || 'temp'}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('gig-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('gig-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const deleteGigImage = async (imageUrl: string): Promise<void> => {
    try {
      // Extract path from URL
      const urlParts = imageUrl.split('/gig-images/');
      if (urlParts.length < 2) throw new Error('Invalid image URL');
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('gig-images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  return {
    uploadGigImage,
    deleteGigImage,
    uploading
  };
};
