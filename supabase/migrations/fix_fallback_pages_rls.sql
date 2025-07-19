-- Fix RLS policies for fallback pages to work properly
-- This migration ensures that both trainers and gyms pages have proper public access

-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Public can view all trainers" ON public.trainers;
DROP POLICY IF EXISTS "Anyone can view active trainers" ON public.trainers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.trainers;

DROP POLICY IF EXISTS "Anyone can view active gyms" ON public.gyms;
DROP POLICY IF EXISTS "Public can view all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gyms;

-- Create comprehensive public read policies for trainers
CREATE POLICY "Public read access for trainers" ON public.trainers
  FOR SELECT USING (true);

-- Create comprehensive public read policies for gyms  
CREATE POLICY "Public read access for gyms" ON public.gyms
  FOR SELECT USING (true);

-- Ensure related tables have public read access
DROP POLICY IF EXISTS "Anyone can view gym images" ON public.gym_images;
CREATE POLICY "Public read access for gym images" ON public.gym_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view gym amenities" ON public.gym_amenities;
CREATE POLICY "Public read access for gym amenities" ON public.gym_amenities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view membership plans" ON public.membership_plans;
CREATE POLICY "Public read access for membership plans" ON public.membership_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view trainer reviews" ON public.trainer_reviews;
CREATE POLICY "Public read access for trainer reviews" ON public.trainer_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view trainer availability" ON public.trainer_availability;
CREATE POLICY "Public read access for trainer availability" ON public.trainer_availability
  FOR SELECT USING (true);

-- Ensure gym hours are publicly accessible
DROP POLICY IF EXISTS "Anyone can view gym hours" ON public.gym_hours;
CREATE POLICY "Public read access for gym hours" ON public.gym_hours
  FOR SELECT USING (true);

-- Ensure gym reviews are publicly accessible
DROP POLICY IF EXISTS "Anyone can view gym reviews" ON public.gym_reviews;
CREATE POLICY "Public read access for gym reviews" ON public.gym_reviews
  FOR SELECT USING (true);

-- Create policies for gigs (services) to be publicly viewable
DROP POLICY IF EXISTS "Anyone can view active gigs" ON public.gigs;
CREATE POLICY "Public read access for active gigs" ON public.gigs
  FOR SELECT USING (status = 'active');

-- Ensure user profiles are readable for trainer/gym owner information
DROP POLICY IF EXISTS "Public can view trainer profiles" ON public.profiles;
CREATE POLICY "Public read access for profiles" ON public.profiles
  FOR SELECT USING (true);

-- Add policy for users table (limited fields for public access)
DROP POLICY IF EXISTS "Public can view user info" ON auth.users;
-- Note: auth.users policies are managed by Supabase Auth, we'll handle this in the application layer

-- Verify all tables have RLS enabled
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance on public queries
CREATE INDEX IF NOT EXISTS idx_trainers_status ON public.trainers(status);
CREATE INDEX IF NOT EXISTS idx_trainers_rating ON public.trainers(average_rating);
CREATE INDEX IF NOT EXISTS idx_gyms_active ON public.gyms(is_active);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON public.gigs(status);
CREATE INDEX IF NOT EXISTS idx_membership_plans_gym ON public.membership_plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_images_gym ON public.gym_images(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_amenities_gym ON public.gym_amenities(gym_id);

-- Add comments for documentation
COMMENT ON POLICY "Public read access for trainers" ON public.trainers IS 
'Allows anonymous users to view all trainer profiles for public website';

COMMENT ON POLICY "Public read access for gyms" ON public.gyms IS 
'Allows anonymous users to view all gym information for public website';

COMMENT ON POLICY "Public read access for active gigs" ON public.gigs IS 
'Allows anonymous users to view active service listings';
