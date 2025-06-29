
-- Add missing RLS policies for existing tables

-- RLS policies for profiles (already enabled, adding missing policies)
CREATE POLICY "Public can view trainer profiles" ON public.profiles 
  FOR SELECT 
  USING (role = 'trainer');

-- RLS policies for bookings (missing some policies)
CREATE POLICY "Clients can view their bookings" ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update their bookings" ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = client_id);

-- RLS policies for gigs (missing some policies)  
CREATE POLICY "Public can view active gigs" ON public.gigs 
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Trainers can view all their gigs" ON public.gigs 
  FOR SELECT 
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create gigs" ON public.gigs 
  FOR INSERT 
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their gigs" ON public.gigs 
  FOR UPDATE 
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their gigs" ON public.gigs 
  FOR DELETE 
  USING (auth.uid() = trainer_id);

-- RLS policies for messages (missing some)
CREATE POLICY "Users can update messages they received (mark as read)" ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- RLS policies for transactions
CREATE POLICY "Trainers can insert their transactions" ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their transactions" ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = trainer_id);

-- RLS policies for reviews
CREATE POLICY "Users can update their reviews" ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = reviewer_id);

-- RLS policies for notifications
CREATE POLICY "System can create notifications" ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create favorites table for clients to save trainers
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, trainer_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Clients can view their favorites" ON public.favorites 
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can add favorites" ON public.favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can remove favorites" ON public.favorites 
  FOR DELETE 
  USING (auth.uid() = client_id);

-- Create search history table
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  search_query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on search_history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for search_history
CREATE POLICY "Users can view their search history" ON public.search_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their search history" ON public.search_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their search history" ON public.search_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('card', 'bank', 'mobile_wallet')) NOT NULL,
  provider TEXT, -- 'stripe', 'bkash', 'nagad', etc.
  details JSONB NOT NULL, -- encrypted payment details
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_methods
CREATE POLICY "Users can view their payment methods" ON public.payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add payment methods" ON public.payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their payment methods" ON public.payment_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their payment methods" ON public.payment_methods 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawal_requests
CREATE POLICY "Trainers can view their withdrawal requests" ON public.withdrawal_requests 
  FOR SELECT 
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create withdrawal requests" ON public.withdrawal_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = trainer_id);

-- Create admin_tasks table for admin operations
CREATE TABLE public.admin_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'trainer_verification', 'dispute_resolution', 'content_moderation'
  related_id UUID, -- can reference trainer_id, booking_id, etc.
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  admin_notes TEXT,
  assigned_admin UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_tasks (only admins should access)
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_favorites_client_id ON public.favorites(client_id);
CREATE INDEX idx_favorites_trainer_id ON public.favorites(trainer_id);
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_withdrawal_requests_trainer_id ON public.withdrawal_requests(trainer_id);
CREATE INDEX idx_admin_tasks_status ON public.admin_tasks(status);
CREATE INDEX idx_admin_tasks_type ON public.admin_tasks(type);

-- Add triggers for updated_at columns
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_tasks_updated_at BEFORE UPDATE ON public.admin_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create notifications for withdrawal requests
CREATE OR REPLACE FUNCTION create_withdrawal_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify trainer when withdrawal request status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.trainer_id,
      'withdrawal_update',
      'Withdrawal Request Updated',
      'Your withdrawal request status has been updated to ' || NEW.status,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER withdrawal_notification_trigger 
  AFTER UPDATE ON public.withdrawal_requests 
  FOR EACH ROW EXECUTE FUNCTION create_withdrawal_notification();

-- Create some helpful views for analytics
CREATE VIEW public.trainer_stats AS
SELECT 
  tp.user_id,
  p.name,
  p.email,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
  AVG(r.rating) as average_rating,
  COUNT(DISTINCT r.id) as total_reviews,
  SUM(CASE WHEN t.status = 'completed' THEN t.net_amount ELSE 0 END) as total_earnings
FROM public.trainer_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
LEFT JOIN public.bookings b ON tp.user_id = b.trainer_id
LEFT JOIN public.reviews r ON tp.user_id = r.reviewee_id
LEFT JOIN public.transactions t ON tp.user_id = t.trainer_id
GROUP BY tp.user_id, p.name, p.email;

-- Create view for popular services
CREATE VIEW public.popular_services AS
SELECT 
  g.category,
  COUNT(*) as gig_count,
  COUNT(DISTINCT b.id) as total_bookings,
  AVG(g.basic_price) as avg_basic_price,
  AVG(g.standard_price) as avg_standard_price,
  AVG(g.premium_price) as avg_premium_price
FROM public.gigs g
LEFT JOIN public.bookings b ON g.trainer_id = b.trainer_id
WHERE g.status = 'active'
GROUP BY g.category
ORDER BY total_bookings DESC;
