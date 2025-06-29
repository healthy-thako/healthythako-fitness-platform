
-- Create workout_plans table
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  duration_weeks INTEGER DEFAULT 1,
  difficulty_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nutrition_plans table
CREATE TABLE public.nutrition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  daily_calories INTEGER,
  macros JSONB DEFAULT '{}'::jsonb,
  guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  meals JSONB DEFAULT '[]'::jsonb,
  total_calories INTEGER,
  plan_type TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update messages table to support plan attachments
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS workout_plan_id UUID REFERENCES public.workout_plans(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS nutrition_plan_id UUID REFERENCES public.nutrition_plans(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS meal_plan_id UUID REFERENCES public.meal_plans(id);

-- Enable RLS on new tables
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for workout_plans
CREATE POLICY "Users can view their workout plans" 
  ON public.workout_plans 
  FOR SELECT 
  USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "Trainers can create workout plans" 
  ON public.workout_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their workout plans" 
  ON public.workout_plans 
  FOR UPDATE 
  USING (auth.uid() = trainer_id);

-- RLS policies for nutrition_plans
CREATE POLICY "Users can view their nutrition plans" 
  ON public.nutrition_plans 
  FOR SELECT 
  USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "Trainers can create nutrition plans" 
  ON public.nutrition_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their nutrition plans" 
  ON public.nutrition_plans 
  FOR UPDATE 
  USING (auth.uid() = trainer_id);

-- RLS policies for meal_plans
CREATE POLICY "Users can view their meal plans" 
  ON public.meal_plans 
  FOR SELECT 
  USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "Trainers can create meal plans" 
  ON public.meal_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their meal plans" 
  ON public.meal_plans 
  FOR UPDATE 
  USING (auth.uid() = trainer_id);

-- Enable real-time for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable real-time for plan tables
ALTER TABLE public.workout_plans REPLICA IDENTITY FULL;
ALTER TABLE public.nutrition_plans REPLICA IDENTITY FULL;
ALTER TABLE public.meal_plans REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nutrition_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plans;
