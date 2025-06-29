
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) {
          console.error('Supabase connection error:', error);
          toast.error('Database connection failed');
          setIsConnected(false);
        } else {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, isLoading };
};
