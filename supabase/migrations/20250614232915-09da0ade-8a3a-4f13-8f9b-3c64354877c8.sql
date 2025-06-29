
-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view gym amenities" ON public.gym_amenities;
DROP POLICY IF EXISTS "Admins can manage gym amenities" ON public.gym_amenities;

-- Create policy for public read access to gym amenities
CREATE POLICY "Anyone can view gym amenities" ON public.gym_amenities
  FOR SELECT USING (true);

-- Create policy for admin write access to gym amenities
CREATE POLICY "Admins can manage gym amenities" ON public.gym_amenities
  FOR ALL USING (true);

-- Ensure realtime is enabled
ALTER TABLE public.gym_amenities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gym_amenities;
