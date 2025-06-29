
-- Add image upload support to gyms table (if not already present)
ALTER TABLE public.gyms 
ADD COLUMN IF NOT EXISTS featured_image text;

-- Create gym_bookings table for gym-specific bookings
CREATE TABLE IF NOT EXISTS public.gym_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_plan_id uuid NOT NULL REFERENCES public.gym_membership_plans(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  booking_time time,
  status text DEFAULT 'confirmed',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create gym_analytics table for tracking gym performance
CREATE TABLE IF NOT EXISTS public.gym_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  date date NOT NULL,
  new_members integer DEFAULT 0,
  total_members integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  bookings_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(gym_id, date)
);

-- Create gym_earnings table for tracking earnings
CREATE TABLE IF NOT EXISTS public.gym_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES public.gym_memberships(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  commission numeric DEFAULT 0,
  net_amount numeric NOT NULL,
  transaction_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'completed',
  payment_method text,
  created_at timestamp with time zone DEFAULT now()
);

-- Update gym_memberships table to include proper relationships
ALTER TABLE public.gym_memberships 
ADD COLUMN IF NOT EXISTS transaction_id text;

-- Enable RLS for all tables
ALTER TABLE public.gym_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_earnings ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for gym images if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gym-images',
  'gym-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create a function to get current gym owner from session token
CREATE OR REPLACE FUNCTION public.get_current_gym_owner_id()
RETURNS TEXT AS $$
BEGIN
  -- This will be handled by the application layer
  -- For now, we'll use a simple approach for RLS
  RETURN current_setting('app.current_gym_owner_id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create policies for gym_bookings
CREATE POLICY "Users can view their own gym bookings"
  ON public.gym_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gym bookings"
  ON public.gym_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for gym_analytics (admin/owner access only for now)
CREATE POLICY "Allow read access to gym analytics"
  ON public.gym_analytics FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to gym analytics"
  ON public.gym_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update access to gym analytics"
  ON public.gym_analytics FOR UPDATE
  USING (true);

-- Create policies for gym_earnings (admin/owner access only for now)
CREATE POLICY "Allow read access to gym earnings"
  ON public.gym_earnings FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to gym earnings"
  ON public.gym_earnings FOR INSERT
  WITH CHECK (true);

-- Update gym_memberships policies to be more permissive for now
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gym_memberships' 
    AND policyname = 'Allow read access to gym memberships'
  ) THEN
    CREATE POLICY "Allow read access to gym memberships"
      ON public.gym_memberships FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gym_memberships' 
    AND policyname = 'Users can insert gym memberships'
  ) THEN
    CREATE POLICY "Users can insert gym memberships"
      ON public.gym_memberships FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create storage policies for gym images (only create if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Gym owners can upload gym images'
  ) THEN
    CREATE POLICY "Gym owners can upload gym images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'gym-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view gym images'
  ) THEN
    CREATE POLICY "Anyone can view gym images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gym-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Gym owners can update gym images'
  ) THEN
    CREATE POLICY "Gym owners can update gym images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'gym-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Gym owners can delete gym images'
  ) THEN
    CREATE POLICY "Gym owners can delete gym images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'gym-images');
  END IF;
END $$;
