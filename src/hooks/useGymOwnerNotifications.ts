import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GymOwnerNotification {
  id: string;
  type: 'new_member' | 'payment_received' | 'membership_expiring' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

export const useGymOwnerNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-owner-notifications', user?.id],
    queryFn: async (): Promise<GymOwnerNotification[]> => {
      if (!user) return [];

      try {
        // Get gym owner record
        const { data: gymOwner, error: ownerError } = await supabase
          .from('gym_owners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (ownerError || !gymOwner) return [];

        // Get gym ID first
        const { data: gyms } = await supabase
          .from('gyms')
          .select('id')
          .eq('gym_owner_id', gymOwner.id);

        if (!gyms || gyms.length === 0) return [];

        const gymIds = gyms.map(g => g.id);

        // Get recent member activities as notifications
        const { data: recentMembers } = await supabase
          .from('gym_members')
          .select('*')
          .in('gym_id', gymIds)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        // Convert to notifications format
        const notifications: GymOwnerNotification[] = [];

        if (recentMembers) {
          recentMembers.forEach(member => {
            if (member.payment_status === 'completed') {
              notifications.push({
                id: `payment-${member.id}`,
                type: 'payment_received',
                title: 'Payment Received',
                message: `₹${member.amount_paid} received from member`,
                is_read: false,
                created_at: member.created_at,
                related_id: member.id
              });
            }

            notifications.push({
              id: `member-${member.id}`,
              type: 'new_member',
              title: 'New Member Joined',
              message: `A new member has joined your gym`,
              is_read: false,
              created_at: member.created_at,
              related_id: member.id
            });
          });
        }

        // Check for expiring memberships
        const { data: expiringMembers } = await supabase
          .from('gym_members')
          .select('*')
          .in('gym_id', gymIds)
          .eq('status', 'active')
          .lte('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('end_date', { ascending: true })
          .limit(5);

        if (expiringMembers) {
          expiringMembers.forEach(member => {
            notifications.push({
              id: `expiring-${member.id}`,
              type: 'membership_expiring',
              title: 'Membership Expiring Soon',
              message: `Member's membership expires on ${new Date(member.end_date).toLocaleDateString()}`,
              is_read: false,
              created_at: member.created_at,
              related_id: member.id
            });
          });
        }

        return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (error) {
        console.error('Error fetching gym owner notifications:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
