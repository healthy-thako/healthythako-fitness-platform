
-- Fix admin system database issues

-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create missing user_activity_logs table structure (if needed)
-- The table exists but let's ensure it has all required columns
ALTER TABLE public.user_activity_logs 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS page_visited TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Fix admin_sessions table foreign key
ALTER TABLE public.admin_sessions 
DROP CONSTRAINT IF EXISTS admin_sessions_admin_id_fkey,
ADD CONSTRAINT admin_sessions_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

-- Create missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Fix RLS policies for admin system

-- Admin users policies
DROP POLICY IF EXISTS "Allow admin operations" ON public.admin_users;
CREATE POLICY "Super admin can manage all admins" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.id = (SELECT admin_id FROM public.admin_sessions WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token')
      AND au.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view own profile" ON public.admin_users
  FOR SELECT USING (
    id = (SELECT admin_id FROM public.admin_sessions WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token')
  );

-- Admin sessions policies
DROP POLICY IF EXISTS "Allow session operations" ON public.admin_sessions;
CREATE POLICY "Admins can manage own sessions" ON public.admin_sessions
  FOR ALL USING (
    admin_id = (SELECT admin_id FROM public.admin_sessions WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token')
  );

-- Profiles policies (for admin user management)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions ads
      JOIN public.admin_users au ON au.id = ads.admin_id
      WHERE ads.expires_at > NOW()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions ads
      JOIN public.admin_users au ON au.id = ads.admin_id
      WHERE ads.expires_at > NOW()
      AND au.is_active = true
    )
  );

-- Trainer profiles policies
CREATE POLICY "Admins can view all trainer profiles" ON public.trainer_profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions ads
      JOIN public.admin_users au ON au.id = ads.admin_id
      WHERE ads.expires_at > NOW()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can update all trainer profiles" ON public.trainer_profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions ads
      JOIN public.admin_users au ON au.id = ads.admin_id
      WHERE ads.expires_at > NOW()
      AND au.is_active = true
    )
  );

-- User activity logs policies
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions ads
      JOIN public.admin_users au ON au.id = ads.admin_id
      WHERE ads.expires_at > NOW()
      AND au.is_active = true
    )
  );

CREATE POLICY "System can insert activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (true);

-- Enable realtime for admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gyms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_tasks;

-- Set replica identity for realtime updates
ALTER TABLE public.admin_users REPLICA IDENTITY FULL;
ALTER TABLE public.admin_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.trainer_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_activity_logs REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.gyms REPLICA IDENTITY FULL;
ALTER TABLE public.admin_tasks REPLICA IDENTITY FULL;
