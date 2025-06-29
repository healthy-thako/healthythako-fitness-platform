import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-session-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin session token
    const sessionToken = req.headers.get('x-admin-session-token');
    if (!sessionToken) {
      console.error('No admin session token provided');
      return new Response(
        JSON.stringify({ error: 'Admin authentication required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the session token exists and is valid
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('admin_id, expires_at')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      console.error('Invalid admin session token:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Invalid admin session' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      console.error('Admin session has expired');
      return new Response(
        JSON.stringify({ error: 'Admin session expired' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Admin authenticated successfully:', session.admin_id);

    const { action, userId, updates, filters, userData, adminId, bookingId } = await req.json()

    if (action === 'getBookings') {
      console.log('Fetching bookings with filters:', filters)
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!client_id(name, email),
          trainer:profiles!trainer_id(name, email)
        `)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters?.trainer_id) {
        query = query.eq('trainer_id', filters.trainer_id)
      }

      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data: bookings, error } = await query

      if (error) {
        console.error('Error fetching bookings:', error)
        throw error
      }

      console.log(`Found ${bookings?.length || 0} bookings`)
      return new Response(
        JSON.stringify(bookings || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateBooking') {
      console.log('Updating booking:', bookingId, updates)
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        console.error('Error updating booking:', error)
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteBooking') {
      console.log('Deleting booking:', bookingId)
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) {
        console.error('Error deleting booking:', error)
        throw error
      }

      console.log('Booking deleted successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getAdminUsers') {
      console.log('Fetching admin users with filters:', filters)
      
      let query = supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.role && filters.role !== 'all' && filters.role !== '') {
        query = query.eq('role', filters.role)
      }

      if (filters?.search && filters.search !== '') {
        query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data: adminUsers, error } = await query

      if (error) {
        console.error('Error fetching admin users:', error)
        throw error
      }

      console.log(`Found ${adminUsers?.length || 0} admin users`)
      return new Response(
        JSON.stringify(adminUsers || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'createAdminUser') {
      console.log('Creating admin user:', userData)
      
      // Hash the password
      const hashedPassword = await hash(userData.password, 10);
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          username: userData.username,
          email: userData.email,
          password_hash: hashedPassword,
          role: userData.role,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating admin user:', error)
        throw error
      }

      console.log('Admin user created successfully')
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateAdminUser') {
      console.log('Updating admin user:', adminId, updates)
      
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        console.error('Error updating admin user:', error)
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteAdminUser') {
      console.log('Deleting admin user:', adminId)
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)

      if (error) {
        console.error('Error deleting admin user:', error)
        throw error
      }

      console.log('Admin user deleted successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getUsers') {
      console.log('Fetching users with filters:', filters)
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          trainer_profiles(is_verified, rate_per_hour, specializations, bio, experience_years)
        `)
        .order('created_at', { ascending: false })

      if (filters?.role && filters.role !== '') {
        query = query.eq('role', filters.role)
      }

      if (filters?.search && filters.search !== '') {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data: users, error } = await query

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      console.log(`Found ${users?.length || 0} users`)
      return new Response(
        JSON.stringify(users || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateUser') {
      console.log('Updating user:', userId, updates)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        throw error
      }

      // Log activity
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action: 'profile_updated_by_admin',
          details: { updates, updated_by: 'admin' }
        })

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verifyTrainer') {
      console.log('Verifying trainer:', userId)
      
      // First check if trainer profile exists
      const { data: trainerProfile, error: checkError } = await supabase
        .from('trainer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (checkError || !trainerProfile) {
        console.error('Trainer profile not found:', checkError)
        return new Response(
          JSON.stringify({ error: 'Trainer profile not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      // Update trainer verification status
      const { error: trainerError } = await supabase
        .from('trainer_profiles')
        .update({ is_verified: true })
        .eq('user_id', userId)

      if (trainerError) {
        console.error('Error verifying trainer:', trainerError)
        throw trainerError
      }

      // Log activity
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action: 'trainer_verified',
          details: { verified_by: 'admin', verified_at: new Date().toISOString() }
        })

      console.log('Trainer verified successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'suspendUser') {
      console.log('Suspending user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error suspending user:', error)
        throw error
      }

      // Log activity
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action: 'user_suspended',
          details: { suspended_by: 'admin', suspended_at: new Date().toISOString() }
        })

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getGyms') {
      console.log('Fetching gyms with filters:', filters)
      
      let query = supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status === 'active') {
        query = query.eq('is_active', true)
      } else if (filters?.status === 'suspended') {
        query = query.eq('is_active', false)
      }

      if (filters?.verification_status) {
        query = query.eq('verification_status', filters.verification_status)
      }

      if (filters?.city) {
        query = query.eq('city', filters.city)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,area.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data: gyms, error } = await query

      if (error) {
        console.error('Error fetching gyms:', error)
        throw error
      }

      console.log(`Found ${gyms?.length || 0} gyms`)
      return new Response(
        JSON.stringify(gyms || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateGym') {
      console.log('Updating gym:', updates.gymId, updates)
      
      const { data, error } = await supabase
        .from('gyms')
        .update(updates)
        .eq('id', updates.gymId)
        .select()
        .single()

      if (error) {
        console.error('Error updating gym:', error)
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verifyGym') {
      console.log('Verifying gym:', updates.gymId)
      
      const { data, error } = await supabase
        .from('gyms')
        .update({
          verification_status: 'verified',
          verification_notes: updates.notes,
          verified_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('id', updates.gymId)
        .select()
        .single()

      if (error) {
        console.error('Error verifying gym:', error)
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'rejectGym') {
      console.log('Rejecting gym:', updates.gymId)
      
      const { data, error } = await supabase
        .from('gyms')
        .update({
          verification_status: 'rejected',
          verification_notes: updates.notes,
          verified_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', updates.gymId)
        .select()
        .single()

      if (error) {
        console.error('Error rejecting gym:', error)
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteGym') {
      console.log('Deleting gym:', updates.gymId)
      
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', updates.gymId)

      if (error) {
        console.error('Error deleting gym:', error)
        throw error
      }

      console.log('Gym deleted successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getTrainers') {
      console.log('Fetching trainers with filters:', filters)
      
      let query = supabase
        .from('trainer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status === 'active') {
        // Join with profiles to check is_active status
        query = supabase
          .from('trainer_profiles')
          .select(`
            *,
            profiles!inner(is_active, name, email, phone, location, gender)
          `)
          .eq('profiles.is_active', true)
          .order('created_at', { ascending: false })
      } else if (filters?.status === 'suspended') {
        query = supabase
          .from('trainer_profiles')
          .select(`
            *,
            profiles!inner(is_active, name, email, phone, location, gender)
          `)
          .eq('profiles.is_active', false)
          .order('created_at', { ascending: false })
      } else {
        query = supabase
          .from('trainer_profiles')
          .select(`
            *,
            profiles(is_active, name, email, phone, location, gender)
          `)
          .order('created_at', { ascending: false })
      }

      if (filters?.verification_status) {
        query = query.eq('verification_status', filters.verification_status)
      }

      if (filters?.search) {
        query = query.or(`bio.ilike.%${filters.search}%,specializations.cs.{${filters.search}}`)
      }

      const { data: trainers, error } = await query

      if (error) {
        console.error('Error fetching trainers:', error)
        throw error
      }

      console.log(`Found ${trainers?.length || 0} trainers`)
      return new Response(
        JSON.stringify(trainers || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateTrainer') {
      console.log('Updating trainer:', updates.trainerId, updates)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.trainerId)
        .select()
        .single()

      if (error) {
        console.error('Error updating trainer:', error)
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verifyTrainerProfile') {
      console.log('Verifying trainer profile:', updates.trainerId)
      
      const { data, error } = await supabase
        .from('trainer_profiles')
        .update({
          is_verified: true,
          verification_status: 'verified',
          verification_notes: updates.notes,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', updates.trainerId)
        .select()
        .single()

      if (error) {
        console.error('Error verifying trainer profile:', error)
        throw error
      }

      // Also update the user's active status
      await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', updates.trainerId)

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'rejectTrainerProfile') {
      console.log('Rejecting trainer profile:', updates.trainerId)
      
      const { data, error } = await supabase
        .from('trainer_profiles')
        .update({
          is_verified: false,
          verification_status: 'rejected',
          verification_notes: updates.notes,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', updates.trainerId)
        .select()
        .single()

      if (error) {
        console.error('Error rejecting trainer profile:', error)
        throw error
      }

      // Also update the user's active status
      await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', updates.trainerId)

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getTrainerStats') {
      console.log('Fetching trainer stats')
      
      // Get all trainers
      const { data: trainers, error: trainersError } = await supabase
        .from('profiles')
        .select(`
          id, name, email, is_active, created_at,
          trainer_profiles(is_verified, verification_status)
        `)
        .eq('role', 'trainer')

      if (trainersError) {
        console.error('Error fetching trainers:', trainersError)
        throw trainersError
      }

      // Get total bookings count
      const { count: totalBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

      if (bookingsError) {
        console.error('Error fetching booking count:', bookingsError)
      }

      const stats = {
        total_trainers: trainers?.length || 0,
        verified_trainers: trainers?.filter((t: any) => t.trainer_profiles?.[0]?.is_verified).length || 0,
        pending_verification: trainers?.filter((t: any) => 
          t.trainer_profiles?.[0]?.verification_status === 'pending' ||
          !t.trainer_profiles?.[0]?.is_verified
        ).length || 0,
        active_trainers: trainers?.filter((t: any) => t.is_active !== false).length || 0,
        suspended_trainers: trainers?.filter((t: any) => t.is_active === false).length || 0,
        total_bookings: totalBookings || 0,
        new_trainers_today: trainers?.filter((t: any) => {
          if (!t.created_at) return false
          const today = new Date().toDateString()
          return new Date(t.created_at).toDateString() === today
        }).length || 0
      }
      
      console.log('Trainer stats:', stats)
      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'createGym') {
      console.log('Creating gym:', userData)
      
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: userData.name,
          description: userData.description,
          address: userData.address,
          city: userData.city,
          area: userData.area,
          phone: userData.phone,
          email: userData.email,
          website: userData.website,
          logo_url: userData.logo_url,
          image_url: userData.image_url,
          images: userData.images,
          gym_owner_id: userData.gym_owner_id,
          operating_hours: userData.operating_hours,
          is_verified: userData.is_verified || false,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          verification_status: userData.verification_status || 'pending'
        })
        .select()
        .single()

      if (gymError) {
        console.error('Error creating gym:', gymError)
        throw gymError
      }

      console.log('Gym created successfully:', gym.id)
      return new Response(
        JSON.stringify(gym),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'createTrainer') {
      console.log('Creating trainer:', userData)
      
      // First create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          location: userData.location,
          gender: userData.gender,
          role: 'trainer',
          is_active: true
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating trainer profile:', profileError)
        throw profileError
      }

      // Then create the trainer profile
      const { data: trainerProfile, error: trainerError } = await supabase
        .from('trainer_profiles')
        .insert({
          user_id: profile.id,
          bio: userData.bio,
          experience_years: userData.experience_years || 0,
          rate_per_hour: userData.rate_per_hour || 0,
          specializations: userData.specializations || [],
          languages: userData.languages || [],
          profile_image: userData.profile_image,
          is_verified: false,
          verification_status: 'pending'
        })
        .select()
        .single()

      if (trainerError) {
        console.error('Error creating trainer profile:', trainerError)
        // Clean up the profile if trainer profile creation fails
        await supabase.from('profiles').delete().eq('id', profile.id)
        throw trainerError
      }

      console.log('Trainer created successfully:', trainerProfile.id)
      return new Response(
        JSON.stringify({ profile, trainerProfile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Admin users error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
