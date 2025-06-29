import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useGymOwnerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-owner-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No authenticated user');

      // Get gym owner record
      const { data: gymOwner, error: ownerError } = await supabase
        .from('gym_owners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (ownerError) throw ownerError;
      if (!gymOwner) throw new Error('No gym owner profile found');

      // Get gym count
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms')
        .select('id')
        .eq('gym_owner_id', gymOwner.id);

      if (gymsError) throw gymsError;

      // Get total members across all gyms
      const { data: members, error: membersError } = await supabase
        .from('gym_members')
        .select('id')
        .in('gym_id', (gyms || []).map(gym => gym.id));

      if (membersError) throw membersError;

      // Get active members (status = 'active')
      const { data: activeMembers, error: activeMembersError } = await supabase
        .from('gym_members')
        .select('id')
        .in('gym_id', (gyms || []).map(gym => gym.id))
        .eq('status', 'active');

      if (activeMembersError) throw activeMembersError;

      return {
        totalGyms: gyms?.length || 0,
        totalMembers: members?.length || 0,
        activeMembers: activeMembers?.length || 0,
        inactiveMembers: (members?.length || 0) - (activeMembers?.length || 0)
      };
    },
    enabled: !!user
  });
};
