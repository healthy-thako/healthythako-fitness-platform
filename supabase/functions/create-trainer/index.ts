
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

    const { trainerData } = await req.json()
    console.log('Creating trainer with data:', trainerData)

    // Validate required fields
    if (!trainerData.email || !trainerData.password || !trainerData.name) {
      throw new Error('Email, password, and name are required')
    }

    // Create user in Supabase Auth using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: trainerData.email,
      password: trainerData.password,
      email_confirm: true,
      user_metadata: {
        name: trainerData.name,
        role: 'trainer'
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

    // Update the profile with additional information (removed is_active)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: trainerData.name,
        phone: trainerData.phone,
        location: trainerData.location,
        gender: trainerData.gender
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    // Create or update trainer profile with new schema
    const { data: trainerProfile, error: trainerError } = await supabase
      .from('trainers')
      .upsert({
        user_id: authData.user.id,
        name: trainerData.name || authData.user.user_metadata?.name || 'Trainer',
        bio: trainerData.bio,
        specialties: trainerData.specializations || [],
        pricing: {
          hourly_rate: trainerData.rate_per_hour || 50
        },
        experience: trainerData.experience_years?.toString() || '1',
        image_url: trainerData.profile_image,
        status: 'active' // Admin created trainers are auto-verified
      })
      .select()
      .single()

    if (trainerError) {
      console.error('Error creating trainer profile:', trainerError)
      throw trainerError
    }

    console.log('Trainer created successfully:', trainerProfile)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user, 
        profile: trainerProfile 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create trainer error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
