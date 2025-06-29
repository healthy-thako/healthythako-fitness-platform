
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES public.admin_users(id) NOT NULL,
  category TEXT,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mass_email_campaigns table
CREATE TABLE public.mass_email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  recipient_filter JSONB NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.admin_users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_campaign_recipients table
CREATE TABLE public.email_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.mass_email_campaigns(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_mass_email_campaigns_status ON public.mass_email_campaigns(status);
CREATE INDEX idx_email_campaign_recipients_campaign ON public.email_campaign_recipients(campaign_id);
CREATE INDEX idx_email_campaign_recipients_status ON public.email_campaign_recipients(status);

-- Add triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mass_email_campaigns_updated_at
  BEFORE UPDATE ON public.mass_email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Admin access only for now)
CREATE POLICY "Admin full access to blog_posts" ON public.blog_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to blog_categories" ON public.blog_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to mass_email_campaigns" ON public.mass_email_campaigns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to email_campaign_recipients" ON public.email_campaign_recipients
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Fitness Tips', 'fitness-tips', 'General fitness and workout tips'),
('Nutrition', 'nutrition', 'Diet and nutrition advice'),
('Training Programs', 'training-programs', 'Structured training programs'),
('Health & Wellness', 'health-wellness', 'Overall health and wellness topics'),
('Success Stories', 'success-stories', 'Client success stories and testimonials');
