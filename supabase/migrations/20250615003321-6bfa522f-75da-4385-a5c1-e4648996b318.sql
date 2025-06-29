
-- Add client_id column to transactions table to properly track who initiated the payment
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS client_id UUID;

-- Update RLS policies for transactions table to work with the booking flow
DROP POLICY IF EXISTS "Trainers can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Clients can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Clients can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Trainers can create transactions for themselves" ON public.transactions;
DROP POLICY IF EXISTS "Allow transaction status updates" ON public.transactions;

-- Allow trainers to view their transactions
CREATE POLICY "Trainers can view their transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = trainer_id);

-- Allow clients to view their transactions  
CREATE POLICY "Clients can view their transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = client_id);

-- Allow clients to create transactions when booking
CREATE POLICY "Clients can create transactions" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Allow trainers to create transactions (for manual entries)
CREATE POLICY "Trainers can create transactions for themselves" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- Allow system updates for payment processing
CREATE POLICY "Allow transaction status updates" ON public.transactions 
  FOR UPDATE USING (true);

-- Also ensure bookings table has proper RLS for the booking flow
DROP POLICY IF EXISTS "Clients can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Trainers can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients and trainers can update bookings" ON public.bookings;

-- Allow clients to view their own bookings
CREATE POLICY "Clients can view their bookings" ON public.bookings 
  FOR SELECT USING (auth.uid() = client_id);

-- Allow trainers to view their bookings
CREATE POLICY "Trainers can view their bookings" ON public.bookings 
  FOR SELECT USING (auth.uid() = trainer_id);

-- Allow clients to create bookings
CREATE POLICY "Clients can create bookings" ON public.bookings 
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Allow both clients and trainers to update bookings (for status changes)
CREATE POLICY "Clients and trainers can update bookings" ON public.bookings 
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = trainer_id);
