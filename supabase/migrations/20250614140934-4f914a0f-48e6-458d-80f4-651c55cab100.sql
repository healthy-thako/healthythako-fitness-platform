
-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the specified admin user (using plaintext password for demo - in production use bcrypt)
INSERT INTO public.admin_users (username, password_hash, email, role)
VALUES ('asifht', 'Healthythako.1212', 'admin@healthythako.com', 'super_admin');

-- Create admin sessions table for session management
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update admin_tasks table to include more fields for better tracking
ALTER TABLE public.admin_tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admin_users(id);
ALTER TABLE public.admin_tasks ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.admin_users(id);
ALTER TABLE public.admin_tasks ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Create analytics aggregation table for dashboard metrics
CREATE TABLE public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_trainers INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  active_trainers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create user activity logs
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system health monitoring table
CREATE TABLE public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin tables (only accessible by admin functions)
CREATE POLICY "Admin users management" ON public.admin_users FOR ALL USING (false);
CREATE POLICY "Admin sessions management" ON public.admin_sessions FOR ALL USING (false);
CREATE POLICY "Platform analytics read-only" ON public.platform_analytics FOR SELECT USING (true);
CREATE POLICY "User activity logs admin only" ON public.user_activity_logs FOR ALL USING (false);
CREATE POLICY "System health admin only" ON public.system_health FOR ALL USING (false);

-- Create function to update analytics daily
CREATE OR REPLACE FUNCTION public.update_daily_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.platform_analytics (
    date,
    total_users,
    total_trainers,
    total_clients,
    new_signups,
    total_bookings,
    completed_bookings,
    cancelled_bookings,
    total_revenue,
    commission_earned,
    active_trainers
  )
  VALUES (
    today_date,
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'trainer'),
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'client'),
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = today_date),
    (SELECT COUNT(*) FROM public.bookings WHERE DATE(created_at) = today_date),
    (SELECT COUNT(*) FROM public.bookings WHERE status = 'completed' AND DATE(updated_at) = today_date),
    (SELECT COUNT(*) FROM public.bookings WHERE status = 'cancelled' AND DATE(updated_at) = today_date),
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE DATE(transaction_date) = today_date AND status = 'completed'),
    (SELECT COALESCE(SUM(commission), 0) FROM public.transactions WHERE DATE(transaction_date) = today_date AND status = 'completed'),
    (SELECT COUNT(DISTINCT trainer_id) FROM public.bookings WHERE DATE(created_at) = today_date)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    total_trainers = EXCLUDED.total_trainers,
    total_clients = EXCLUDED.total_clients,
    new_signups = EXCLUDED.new_signups,
    total_bookings = EXCLUDED.total_bookings,
    completed_bookings = EXCLUDED.completed_bookings,
    cancelled_bookings = EXCLUDED.cancelled_bookings,
    total_revenue = EXCLUDED.total_revenue,
    commission_earned = EXCLUDED.commission_earned,
    active_trainers = EXCLUDED.active_trainers;
END;
$$;
