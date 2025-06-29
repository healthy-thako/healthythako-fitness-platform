
-- Create gym_member_purchases table to track client gym membership purchases
CREATE TABLE IF NOT EXISTS public.gym_member_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.gym_membership_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_member_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gym_member_purchases
CREATE POLICY "Users can view their own memberships" 
  ON public.gym_member_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships" 
  ON public.gym_member_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" 
  ON public.gym_member_purchases 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_gym_member_purchases_updated_at 
  BEFORE UPDATE ON public.gym_member_purchases 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_gym_member_purchases_user_id ON public.gym_member_purchases(user_id);
CREATE INDEX idx_gym_member_purchases_gym_id ON public.gym_member_purchases(gym_id);
CREATE INDEX idx_gym_member_purchases_status ON public.gym_member_purchases(status);

-- Create a function to handle membership expiry
CREATE OR REPLACE FUNCTION public.update_expired_memberships()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.gym_member_purchases 
  SET status = 'expired', updated_at = now()
  WHERE end_date < CURRENT_DATE 
  AND status = 'active';
END;
$$;
