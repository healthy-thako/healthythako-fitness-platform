-- Fix Admin System Database Schema
-- This migration creates and fixes all necessary tables for the admin system

-- 1. Create admin_users table if not exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  permissions JSONB DEFAULT '{}'::jsonb
);

-- 2. Create admin_sessions table if not exists
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 3. Create email_campaigns table if not exists
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT DEFAULT 'newsletter' CHECK (template_type IN ('newsletter', 'promotional', 'announcement', 'welcome')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'clients', 'trainers', 'gym_owners')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0
);

-- 4. Create blog_categories table if not exists
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Update blog_posts table to reference admin_users
DO $$ 
BEGIN
  -- Add author_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN author_id UUID;
  END IF;
  
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'blog_posts' AND constraint_name = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE blog_posts DROP CONSTRAINT blog_posts_author_id_fkey;
  END IF;
  
  -- Add new foreign key constraint
  ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL;
END $$;

-- 6. Ensure waitlist_entries table has proper structure
DO $$ 
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' AND column_name = 'status'
  ) THEN
    ALTER TABLE waitlist_entries ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected'));
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE waitlist_entries ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Add source column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' AND column_name = 'source'
  ) THEN
    ALTER TABLE waitlist_entries ADD COLUMN source TEXT;
  END IF;
  
  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' AND column_name = 'notes'
  ) THEN
    ALTER TABLE waitlist_entries ADD COLUMN notes TEXT;
  END IF;
END $$;

-- 7. Fix admin_tasks table for support system
DO $$ 
BEGIN
  -- Add priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_tasks' AND column_name = 'priority'
  ) THEN
    ALTER TABLE admin_tasks ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
  END IF;
  
  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_tasks' AND column_name = 'type'
  ) THEN
    ALTER TABLE admin_tasks ADD COLUMN type TEXT DEFAULT 'general' CHECK (type IN ('general', 'technical', 'billing', 'dispute', 'verification'));
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_tasks' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE admin_tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 8. Insert default admin user (if not exists)
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES ('admin', 'admin@healthythako.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 9. Insert default blog categories
INSERT INTO blog_categories (name, slug, description) VALUES 
('Fitness Tips', 'fitness-tips', 'General fitness and wellness tips'),
('Nutrition', 'nutrition', 'Diet and nutrition advice'),
('Training', 'training', 'Workout routines and training methods'),
('Health', 'health', 'General health and wellbeing'),
('Announcements', 'announcements', 'Platform updates and announcements')
ON CONFLICT (slug) DO NOTHING;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_entries(status);

-- 11. Create updated_at trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_waitlist_entries_updated_at ON waitlist_entries;
CREATE TRIGGER update_waitlist_entries_updated_at BEFORE UPDATE ON waitlist_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_tasks_updated_at ON admin_tasks;
CREATE TRIGGER update_admin_tasks_updated_at BEFORE UPDATE ON admin_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Create RLS policies for admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin users can access their own data
CREATE POLICY "Admin users can view own data" ON admin_users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Admin users can update own data" ON admin_users FOR UPDATE USING (auth.uid()::text = id::text);

-- Admin sessions are accessible by the session owner
CREATE POLICY "Admin can access own sessions" ON admin_sessions FOR ALL USING (auth.uid()::text = admin_user_id::text);

-- Email campaigns are accessible by admins
CREATE POLICY "Admins can access email campaigns" ON email_campaigns FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text AND is_active = true
  )
);

COMMENT ON TABLE admin_users IS 'Admin user accounts for system management';
COMMENT ON TABLE admin_sessions IS 'Active admin sessions with JWT tokens';
COMMENT ON TABLE email_campaigns IS 'Mass email campaigns for user communication';
COMMENT ON TABLE blog_categories IS 'Categories for blog posts organization'; 