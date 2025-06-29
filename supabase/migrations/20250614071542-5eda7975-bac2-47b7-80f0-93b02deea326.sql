
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'trainer')),
  name TEXT,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainer profiles table
CREATE TABLE public.trainer_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  profile_image TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  rate_per_hour DECIMAL(10,2),
  availability JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_years INTEGER,
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on trainer_profiles
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS policies for trainer_profiles
CREATE POLICY "Trainers can view their own profile" 
  ON public.trainer_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Trainers can update their own profile" 
  ON public.trainer_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Trainers can insert their own profile" 
  ON public.trainer_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Public can view trainer profiles (for browsing)
CREATE POLICY "Public can view trainer profiles" 
  ON public.trainer_profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  
  -- If the user is a trainer, create trainer profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'trainer' THEN
    INSERT INTO public.trainer_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
