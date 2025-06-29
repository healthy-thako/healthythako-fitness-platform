
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching admin analytics...')

    // Get current date ranges
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Get total users count
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('role', { count: 'exact' })

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    const totalUsers = allUsers?.length || 0
    const totalClients = allUsers?.filter(u => u.role === 'client').length || 0
    const totalTrainers = allUsers?.filter(u => u.role === 'trainer').length || 0

    // Get today's bookings
    const { data: todayBookings, count: todayBookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString().split('T')[0])

    // Get total revenue from completed transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, commission, status')
      .eq('status', 'completed')

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0
    const commissionEarned = transactions?.reduce((sum, t) => sum + Number(t.commission || 0), 0) || 0

    // Get active trainers (those with bookings in last 7 days)
    const { data: activeTrainerData, error: activeTrainersError } = await supabase
      .from('bookings')
      .select('trainer_id')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (activeTrainersError) {
      console.error('Error fetching active trainers:', activeTrainersError)
    }

    const activeTrainers = new Set(activeTrainerData?.map(b => b.trainer_id)).size

    // Get pending trainer verifications
    const { data: pendingTrainers, count: pendingCount, error: pendingError } = await supabase
      .from('trainer_profiles')
      .select('*', { count: 'exact' })
      .eq('is_verified', false)

    if (pendingError) {
      console.error('Error fetching pending trainers:', pendingError)
    }

    // Get pending payouts
    const { data: pendingPayouts, error: payoutsError } = await supabase
      .from('transactions')
      .select('net_amount, amount')
      .eq('status', 'pending')

    if (payoutsError) {
      console.error('Error fetching pending payouts:', payoutsError)
    }

    const pendingPayoutAmount = pendingPayouts?.reduce((sum, t) => sum + Number(t.net_amount || t.amount || 0), 0) || 0

    // Get new signups today
    const { data: newSignups, count: newSignupsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString().split('T')[0])

    // Calculate average response time (mock for now, would need message data)
    const avgResponseTime = 2.5

    const analytics = {
      total_users: totalUsers,
      total_clients: totalClients,
      total_trainers: totalTrainers,
      today_bookings: todayBookingsCount || 0,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      commission_earned: Math.round(commissionEarned * 100) / 100,
      active_trainers: activeTrainers,
      pending_verifications: pendingCount || 0,
      pending_payouts: Math.round(pendingPayoutAmount * 100) / 100,
      new_signups_today: newSignupsCount || 0,
      avg_response_time: avgResponseTime
    }

    console.log('Analytics result:', analytics)

    return new Response(
      JSON.stringify(analytics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
