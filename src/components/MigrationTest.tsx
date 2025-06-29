import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const MigrationTest = () => {
  // Test basic database connectivity
  const { data: connectionTest, isLoading: connectionLoading, error: connectionError } = useQuery({
    queryKey: ['migration-test-connection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { success: true, message: 'Database connection successful' };
    }
  });

  // Test trainer data
  const { data: trainerTest, isLoading: trainerLoading, error: trainerError } = useQuery({
    queryKey: ['migration-test-trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          id,
          name,
          specialty,
          users!trainers_user_id_fkey(full_name, email)
        `)
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  // Test trainer search function
  const { data: searchTest, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['migration-test-search'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_trainers', {
        search_query: '',
        specialty_filter: '',
        gym_id_filter: null,
        min_rating: 0,
        limit_count: 3,
        offset_count: 0
      });

      if (error) throw error;
      return data;
    }
  });

  // Test membership plans
  const { data: membershipTest, isLoading: membershipLoading, error: membershipError } = useQuery({
    queryKey: ['migration-test-membership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  // Test reviews
  const { data: reviewsTest, isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: ['migration-test-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_user_id_fkey(full_name)
        `)
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  // Test gym data
  const { data: gymTest, isLoading: gymLoading, error: gymError } = useQuery({
    queryKey: ['migration-test-gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select(`
          id,
          name,
          address,
          owner:users!gyms_owner_id_fkey(full_name, email)
        `)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Test booking data
  const { data: bookingTest, isLoading: bookingLoading, error: bookingError } = useQuery({
    queryKey: ['migration-test-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_bookings')
        .select(`
          id,
          session_date,
          session_time,
          status,
          total_amount
        `)
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  // Test messaging system
  const { data: messageTest, isLoading: messageLoading, error: messageError } = useQuery({
    queryKey: ['migration-test-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at
        `)
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  // Test reviews system
  const { data: reviewTest, isLoading: reviewLoading, error: reviewError } = useQuery({
    queryKey: ['migration-test-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_reviews')
        .select(`
          id,
          trainer_id,
          user_id,
          rating,
          comment
        `)
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  const TestResult = ({ 
    title, 
    isLoading, 
    error, 
    data, 
    dataCount 
  }: { 
    title: string; 
    isLoading: boolean; 
    error: any; 
    data: any; 
    dataCount?: number;
  }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : error ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {title}
          {!isLoading && !error && (
            <Badge variant="secondary">
              {dataCount !== undefined ? `${dataCount} records` : 'Success'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-gray-600">Testing connection...</p>
        )}
        {error && (
          <div className="text-red-600">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
        {!isLoading && !error && data && (
          <div className="text-green-600">
            <p className="font-medium">✅ Test passed successfully</p>
            {Array.isArray(data) && data.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Sample data:</p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(data[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Database Migration Test
        </h1>
        <p className="text-gray-600">
          Testing connectivity and data access with the new database schema
        </p>
      </div>

      <div className="grid gap-4">
        <TestResult
          title="Database Connection"
          isLoading={connectionLoading}
          error={connectionError}
          data={connectionTest}
        />

        <TestResult
          title="Trainer Data Access"
          isLoading={trainerLoading}
          error={trainerError}
          data={trainerTest}
          dataCount={trainerTest?.length}
        />

        <TestResult
          title="Trainer Search Function"
          isLoading={searchLoading}
          error={searchError}
          data={searchTest}
          dataCount={searchTest?.length}
        />

        <TestResult
          title="Membership Plans"
          isLoading={membershipLoading}
          error={membershipError}
          data={membershipTest}
          dataCount={membershipTest?.length}
        />

        <TestResult
          title="Reviews System"
          isLoading={reviewsLoading}
          error={reviewsError}
          data={reviewsTest}
          dataCount={reviewsTest?.length}
        />

        <TestResult
          title="Gym Data Access"
          isLoading={gymLoading}
          error={gymError}
          data={gymTest}
          dataCount={gymTest?.length}
        />

        <TestResult
          title="Booking Data Access"
          isLoading={bookingLoading}
          error={bookingError}
          data={bookingTest}
          dataCount={bookingTest?.length}
        />

        <TestResult
          title="Messaging System"
          isLoading={messageLoading}
          error={messageError}
          data={messageTest}
          dataCount={messageTest?.length}
        />

        <TestResult
          title="Reviews System"
          isLoading={reviewLoading}
          error={reviewError}
          data={reviewTest}
          dataCount={reviewTest?.length}
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Migration Status</h3>
        <div className="text-sm text-blue-800">
          <p>✅ Database connection updated to new Supabase instance</p>
          <p>✅ TypeScript types generated for new schema</p>
          <p>✅ Authentication system updated for new user structure</p>
          <p>✅ Trainer search and management updated</p>
          <p>✅ Gym search and management updated</p>
          <p>✅ Booking system updated for new schema</p>
          <p>✅ Messaging system updated (chat_conversations + chat_messages)</p>
          <p>✅ Reviews system updated (trainer_reviews)</p>
          <p>✅ Transactions system updated (payment_transactions)</p>
          <p>✅ Real-time subscriptions updated</p>
          <p>⚠️ Gigs system disabled (no equivalent in new schema)</p>
        </div>
      </div>
    </div>
  );
};

export default MigrationTest;
