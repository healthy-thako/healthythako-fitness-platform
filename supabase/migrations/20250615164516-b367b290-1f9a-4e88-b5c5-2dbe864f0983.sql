
-- Fix the database schema mismatches - check for existing constraints first
DO $$ 
BEGIN
    -- Add gym_members user_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_members_user_id_fkey' 
        AND table_name = 'gym_members'
    ) THEN
        ALTER TABLE public.gym_members 
        ADD CONSTRAINT gym_members_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add gym_members plan_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_members_plan_id_fkey' 
        AND table_name = 'gym_members'
    ) THEN
        ALTER TABLE public.gym_members 
        ADD CONSTRAINT gym_members_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES public.gym_membership_plans(id) ON DELETE CASCADE;
    END IF;

    -- Add gyms gym_owner_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gyms_gym_owner_id_fkey' 
        AND table_name = 'gyms'
    ) THEN
        ALTER TABLE public.gyms 
        ADD CONSTRAINT gyms_gym_owner_id_fkey 
        FOREIGN KEY (gym_owner_id) REFERENCES public.gym_owners(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on tables if not already enabled
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_membership_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Gym owners can view their own gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners can insert their own gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners can update their own gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners can delete their own gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners can view their gym members" ON public.gym_members;
DROP POLICY IF EXISTS "Gym owners can manage their gym members" ON public.gym_members;
DROP POLICY IF EXISTS "Gym owners can view their gym plans" ON public.gym_membership_plans;
DROP POLICY IF EXISTS "Gym owners can manage their gym plans" ON public.gym_membership_plans;

-- Create RLS policies for gym owners
CREATE POLICY "Gym owners can view their own gyms" ON public.gyms
  FOR SELECT USING (gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid);

CREATE POLICY "Gym owners can insert their own gyms" ON public.gyms
  FOR INSERT WITH CHECK (gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid);

CREATE POLICY "Gym owners can update their own gyms" ON public.gyms
  FOR UPDATE USING (gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid);

CREATE POLICY "Gym owners can delete their own gyms" ON public.gyms
  FOR DELETE USING (gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid);

-- Create RLS policies for gym members
CREATE POLICY "Gym owners can view their gym members" ON public.gym_members
  FOR SELECT USING (
    gym_id IN (
      SELECT id FROM public.gyms 
      WHERE gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid
    )
  );

CREATE POLICY "Gym owners can manage their gym members" ON public.gym_members
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM public.gyms 
      WHERE gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid
    )
  );

-- Create RLS policies for gym membership plans
CREATE POLICY "Gym owners can view their gym plans" ON public.gym_membership_plans
  FOR SELECT USING (
    gym_id IN (
      SELECT id FROM public.gyms 
      WHERE gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid
    )
  );

CREATE POLICY "Gym owners can manage their gym plans" ON public.gym_membership_plans
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM public.gyms 
      WHERE gym_owner_id = current_setting('app.current_gym_owner_id', true)::uuid
    )
  );
