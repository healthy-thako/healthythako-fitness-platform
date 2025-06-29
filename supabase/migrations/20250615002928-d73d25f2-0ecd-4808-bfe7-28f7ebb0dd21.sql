

-- Check current RLS policies for transactions table and fix them
-- First, let's drop existing policies if they exist
DROP POLICY IF EXISTS "Trainers can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Clients can create transactions" ON public.transactions;

-- Create proper RLS policies for transactions table
-- Allow trainers to view their own transactions
CREATE POLICY "Trainers can view their transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = trainer_id);

-- Allow authenticated users to create transactions (needed for booking flow)
CREATE POLICY "Users can create transactions" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow system to update transaction status
CREATE POLICY "System can update transactions" ON public.transactions 
  FOR UPDATE USING (true);

