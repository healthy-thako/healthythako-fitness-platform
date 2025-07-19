import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userData } = await req.json()
    console.log('Creating user with data:', userData)

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      throw new Error('Email, password, name, and role are required')
    }

    // Validate role
    const validRoles = ['client', 'trainer', 'gym_owner']
    if (!validRoles.includes(userData.role)) {
      throw new Error('Invalid role. Must be client, trainer, or gym_owner')
    }

    // Create user in Supabase Auth using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('Failed to create user - no user returned')
    }

    console.log('User created with ID:', authData.user.id)

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the user with additional information
    const { error: profileError } = await supabase
      .from('users')
      .update({
        full_name: userData.name,
        phone_number: userData.phone,
        user_type: userData.role || 'client'
        role: userData.role
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    // Create role-specific profiles
    let roleProfile = null

    if (userData.role === 'trainer') {
      // Create trainer profile
      const { data: trainerProfile, error: trainerError } = await supabase
        .from('trainers')
        .upsert({
          user_id: authData.user.id,
          name: userData.name,
          bio: userData.bio || '',
          specialties: userData.specializations || [],
          contact_email: userData.email,
          rate_per_hour: userData.rate_per_hour || 0,
          experience_years: userData.experience_years || 0,
          profile_image: userData.profile_image || '',
          is_verified: true // Admin created trainers are auto-verified
        })
        .select()
        .single()

      if (trainerError) {
        console.error('Error creating trainer profile:', trainerError)
        throw trainerError
      }

      roleProfile = trainerProfile
    } else if (userData.role === 'gym_owner') {
      // For gym owners, we don't need to create a separate profile table entry
      // The gym will be linked to this user via gym_owner_id
      console.log('Gym owner account created, ready to be linked to gym')
    }

    console.log('User created successfully with role:', userData.role)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user, 
        roleProfile: roleProfile 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create user error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 