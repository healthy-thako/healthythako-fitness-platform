
-- Add RLS policies for messages table (only if not exists)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them to ensure consistency
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Recreate messages policies
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Add RLS policies for other critical tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate bookings policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Clients can create bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = client_id OR auth.uid() = trainer_id);

-- Add RLS for favorites table
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites" 
  ON public.favorites 
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Users can manage their own favorites" 
  ON public.favorites 
  FOR ALL 
  USING (auth.uid() = client_id);

-- Add RLS for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS for gigs table
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active gigs" ON public.gigs;
DROP POLICY IF EXISTS "Trainers can manage their own gigs" ON public.gigs;

CREATE POLICY "Anyone can view active gigs" 
  ON public.gigs 
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Trainers can manage their own gigs" 
  ON public.gigs 
  FOR ALL 
  USING (auth.uid() = trainer_id);

-- Add RLS for reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON public.reviews;

CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews for their bookings" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id AND 
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND (client_id = auth.uid() OR trainer_id = auth.uid())
    )
  );

-- Update the trigger function to handle profile creation properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name;
  
  -- If the user is a trainer, create trainer profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'trainer' THEN
    INSERT INTO public.trainer_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
