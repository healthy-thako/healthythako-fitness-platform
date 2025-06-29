-- Fix authentication roles and constraints
-- This migration fixes the role constraints to support all 4 roles: client, trainer, gym_owner, admin

-- First, let's check and fix the profiles table constraint
-- Drop the existing constraint if it exists and recreate it properly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the correct constraint for role validation with all 4 roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('client', 'trainer', 'gym_owner', 'admin'));

-- Add is_verified column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Update the handle_new_user function to work correctly with all roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    false
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
  
  -- If the user is a gym owner, create gym owner profile  
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'gym_owner' THEN
    INSERT INTO public.gym_owners (user_id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure gym_owners table has the proper foreign key relationship
ALTER TABLE public.gym_owners 
DROP CONSTRAINT IF EXISTS gym_owners_user_id_fkey,
ADD CONSTRAINT gym_owners_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; 