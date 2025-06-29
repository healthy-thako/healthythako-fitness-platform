
-- Create bookings table for orders/sessions
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  package_type TEXT CHECK (package_type IN ('basic', 'standard', 'premium')),
  session_count INTEGER DEFAULT 1,
  session_duration INTEGER DEFAULT 60, -- minutes
  mode TEXT CHECK (mode IN ('online', 'in-person', 'home')) DEFAULT 'online',
  status TEXT CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'revision')) DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for trainer-client communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gigs table for trainer services
CREATE TABLE public.gigs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  basic_price DECIMAL(10,2),
  basic_description TEXT,
  basic_delivery_days INTEGER DEFAULT 7,
  standard_price DECIMAL(10,2),
  standard_description TEXT,
  standard_delivery_days INTEGER DEFAULT 5,
  premium_price DECIMAL(10,2),
  premium_description TEXT,
  premium_delivery_days INTEGER DEFAULT 3,
  status TEXT CHECK (status IN ('active', 'paused', 'draft')) DEFAULT 'draft',
  images TEXT[],
  faq JSONB DEFAULT '[]'::jsonb,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for earnings tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'withdrawn')) DEFAULT 'pending',
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table for ratings and feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- can reference booking, gig, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings 
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Clients can create bookings" ON public.bookings 
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Trainers can update their bookings" ON public.bookings 
  FOR UPDATE USING (auth.uid() = trainer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages" ON public.messages 
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policies for gigs
CREATE POLICY "Everyone can view active gigs" ON public.gigs 
  FOR SELECT USING (status = 'active' OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage their gigs" ON public.gigs 
  FOR ALL USING (auth.uid() = trainer_id);

-- RLS Policies for transactions
CREATE POLICY "Trainers can view their transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = trainer_id);

-- RLS Policies for reviews
CREATE POLICY "Users can view reviews" ON public.reviews 
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews 
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_bookings_trainer_id ON public.bookings(trainer_id);
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_gigs_trainer_id ON public.gigs(trainer_id);
CREATE INDEX idx_transactions_trainer_id ON public.transactions(trainer_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON public.gigs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify trainer of new booking
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.trainer_id,
      'new_booking',
      'New Booking Request',
      'You have received a new booking request',
      NEW.id
    );
  END IF;
  
  -- Notify client of booking status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.client_id,
      'booking_update',
      'Booking Status Updated',
      'Your booking status has been updated to ' || NEW.status,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER booking_notification_trigger 
  AFTER INSERT OR UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE FUNCTION create_booking_notification();
