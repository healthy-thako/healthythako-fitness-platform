
-- Create gym_members table to fix the TypeScript errors
CREATE TABLE public.gym_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.gym_membership_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

-- Create policies for gym_members
CREATE POLICY "Gym owners can view their gym members" 
  ON public.gym_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.gyms 
      WHERE gyms.id = gym_members.gym_id 
      AND gyms.gym_owner_id = auth.uid()
    )
  );

CREATE POLICY "Gym owners can insert members for their gyms" 
  ON public.gym_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gyms 
      WHERE gyms.id = gym_members.gym_id 
      AND gyms.gym_owner_id = auth.uid()
    )
  );

CREATE POLICY "Gym owners can update their gym members" 
  ON public.gym_members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.gyms 
      WHERE gyms.id = gym_members.gym_id 
      AND gyms.gym_owner_id = auth.uid()
    )
  );

CREATE POLICY "Gym owners can delete their gym members" 
  ON public.gym_members 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.gyms 
      WHERE gyms.id = gym_members.gym_id 
      AND gyms.gym_owner_id = auth.uid()
    )
  );

-- Users can view their own memberships
CREATE POLICY "Users can view their own memberships" 
  ON public.gym_members 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_gym_members_updated_at 
  BEFORE UPDATE ON public.gym_members 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_gym_members_gym_id ON public.gym_members(gym_id);
CREATE INDEX idx_gym_members_user_id ON public.gym_members(user_id);
CREATE INDEX idx_gym_members_status ON public.gym_members(status);
