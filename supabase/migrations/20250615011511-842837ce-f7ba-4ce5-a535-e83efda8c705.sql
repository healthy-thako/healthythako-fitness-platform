
-- Create gym_owners table for separate gym owner authentication
CREATE TABLE IF NOT EXISTS public.gym_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  business_license TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create gym_owner_sessions table for session management
CREATE TABLE IF NOT EXISTS public.gym_owner_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_owner_id UUID REFERENCES public.gym_owners(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update gyms table to reference gym_owners instead of auth.users
ALTER TABLE public.gyms 
ADD COLUMN IF NOT EXISTS gym_owner_id UUID REFERENCES public.gym_owners(id);

-- Enable RLS on gym owner tables
ALTER TABLE public.gym_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_owner_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gym owners
CREATE POLICY "Gym owners can view their own profile" ON public.gym_owners
  FOR SELECT USING (id = current_setting('app.current_gym_owner_id', true)::uuid);

CREATE POLICY "Allow gym owner operations" ON public.gym_owners 
  FOR ALL USING (true);

CREATE POLICY "Allow session operations" ON public.gym_owner_sessions 
  FOR ALL USING (true);

-- Update gym policies to work with gym_owner_id
DROP POLICY IF EXISTS "Gym owners can manage their gyms" ON public.gyms;
CREATE POLICY "Gym owners can manage their gyms" ON public.gyms
  FOR ALL USING (gym_owner_id IS NOT NULL AND gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gym_owner_sessions_token ON public.gym_owner_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_gym_owner_sessions_expires ON public.gym_owner_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_gym_owners_email ON public.gym_owners(email);
CREATE INDEX IF NOT EXISTS idx_gyms_gym_owner_id ON public.gyms(gym_owner_id);

-- Add updated_at trigger for gym_owners
CREATE TRIGGER update_gym_owners_updated_at 
    BEFORE UPDATE ON public.gym_owners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
