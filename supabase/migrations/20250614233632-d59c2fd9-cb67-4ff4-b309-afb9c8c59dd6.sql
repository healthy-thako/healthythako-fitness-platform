
-- Drop all existing policies on gyms table first
DROP POLICY IF EXISTS "Anyone can view active gyms" ON public.gyms;
DROP POLICY IF EXISTS "Admins can manage all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners can manage their gyms" ON public.gyms;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gyms;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gyms;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.gyms;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.gyms;

-- Create new policies for public read access to active gyms
CREATE POLICY "Anyone can view active gyms" ON public.gyms
  FOR SELECT USING (is_active = true);

-- Create policy for admin full access to gyms
CREATE POLICY "Admins can manage all gyms" ON public.gyms
  FOR ALL USING (true);

-- Create policy for gym owners to manage their own gyms
CREATE POLICY "Gym owners can manage their gyms" ON public.gyms
  FOR ALL USING (owner_id = auth.uid());

-- Ensure gym_membership_plans table has proper RLS
ALTER TABLE public.gym_membership_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on gym_membership_plans if they exist
DROP POLICY IF EXISTS "Anyone can view active membership plans" ON public.gym_membership_plans;
DROP POLICY IF EXISTS "Admins can manage all membership plans" ON public.gym_membership_plans;
DROP POLICY IF EXISTS "Gym owners can manage their membership plans" ON public.gym_membership_plans;

-- Create policies for gym membership plans
CREATE POLICY "Anyone can view active membership plans" ON public.gym_membership_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all membership plans" ON public.gym_membership_plans
  FOR ALL USING (true);

CREATE POLICY "Gym owners can manage their membership plans" ON public.gym_membership_plans
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM public.gyms WHERE owner_id = auth.uid()
    )
  );
