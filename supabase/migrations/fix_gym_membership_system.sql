-- Fix gym membership system and payment integration
-- Migration: fix_gym_membership_system

-- Ensure gym_memberships table exists with correct structure
CREATE TABLE IF NOT EXISTS gym_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES gym_membership_plans(id) ON DELETE SET NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'uddoktapay',
  transaction_id TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gym_id, is_active) -- Prevent multiple active memberships for same user/gym
);

-- Ensure gym_membership_plans table exists
CREATE TABLE IF NOT EXISTS gym_membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure transactions table can handle gym memberships
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS membership_id UUID REFERENCES gym_memberships(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gym_memberships_user_id ON gym_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_memberships_gym_id ON gym_memberships(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_memberships_active ON gym_memberships(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gym_membership_plans_gym_id ON gym_membership_plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gym_id ON transactions(gym_id);
CREATE INDEX IF NOT EXISTS idx_transactions_membership_id ON transactions(membership_id);

-- RLS Policies for gym_memberships
ALTER TABLE gym_memberships ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users can view own gym memberships" ON gym_memberships
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert memberships (for payment processing)
CREATE POLICY "Service role can insert gym memberships" ON gym_memberships
    FOR INSERT WITH CHECK (true);

-- Users can update their own memberships (for cancellation etc)
CREATE POLICY "Users can update own gym memberships" ON gym_memberships
    FOR UPDATE USING (auth.uid() = user_id);

-- Gym owners can view memberships for their gyms
CREATE POLICY "Gym owners can view their gym memberships" ON gym_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM gyms g
            JOIN gym_owners go ON g.gym_owner_id = go.id
            WHERE g.id = gym_memberships.gym_id 
            AND go.user_id = auth.uid()
        )
    );

-- RLS Policies for gym_membership_plans
ALTER TABLE gym_membership_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active membership plans
CREATE POLICY "Anyone can view active membership plans" ON gym_membership_plans
    FOR SELECT USING (is_active = true);

-- Gym owners can manage their gym's membership plans
CREATE POLICY "Gym owners can manage their membership plans" ON gym_membership_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM gyms g
            JOIN gym_owners go ON g.gym_owner_id = go.id
            WHERE g.id = gym_membership_plans.gym_id 
            AND go.user_id = auth.uid()
        )
    );

-- Create function to increment gym member count
CREATE OR REPLACE FUNCTION increment_gym_member_count(gym_id UUID)
RETURNS void AS $$
BEGIN
    -- This function can be used to update gym statistics
    -- For now, it's a placeholder that can be expanded later
    UPDATE gyms 
    SET updated_at = NOW()
    WHERE id = gym_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON gym_memberships TO anon, authenticated;
GRANT SELECT ON gym_membership_plans TO anon, authenticated;
GRANT INSERT, UPDATE ON gym_memberships TO authenticated;
GRANT ALL ON gym_membership_plans TO authenticated;
GRANT EXECUTE ON FUNCTION increment_gym_member_count TO authenticated, service_role;

-- Insert default membership plans for existing gyms
INSERT INTO gym_membership_plans (gym_id, name, description, price, duration_days)
SELECT 
    id as gym_id,
    'Monthly Membership' as name,
    'Full access to gym facilities for one month' as description,
    monthly_price as price,
    30 as duration_days
FROM gyms 
WHERE is_active = true
AND id NOT IN (SELECT DISTINCT gym_id FROM gym_membership_plans)
ON CONFLICT DO NOTHING;

-- Update gym table to ensure it has proper relationships
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10,2) DEFAULT 0;

-- Create function to update gym statistics
CREATE OR REPLACE FUNCTION update_gym_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        -- Increment member count and revenue for new active membership
        UPDATE gyms 
        SET 
            member_count = COALESCE(member_count, 0) + 1,
            total_revenue = COALESCE(total_revenue, 0) + NEW.amount_paid,
            updated_at = NOW()
        WHERE id = NEW.gym_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE gyms 
            SET member_count = COALESCE(member_count, 0) + 1
            WHERE id = NEW.gym_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE gyms 
            SET member_count = GREATEST(COALESCE(member_count, 1) - 1, 0)
            WHERE id = NEW.gym_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        -- Decrement member count when active membership is deleted
        UPDATE gyms 
        SET member_count = GREATEST(COALESCE(member_count, 1) - 1, 0)
        WHERE id = OLD.gym_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for gym statistics updates
DROP TRIGGER IF EXISTS update_gym_stats_trigger ON gym_memberships;
CREATE TRIGGER update_gym_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON gym_memberships
    FOR EACH ROW EXECUTE FUNCTION update_gym_stats();

-- Create function to clean up expired memberships
CREATE OR REPLACE FUNCTION cleanup_expired_memberships()
RETURNS void AS $$
BEGIN
    UPDATE gym_memberships 
    SET 
        status = 'expired',
        is_active = false,
        updated_at = NOW()
    WHERE end_date < CURRENT_DATE 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the cleanup function
GRANT EXECUTE ON FUNCTION cleanup_expired_memberships TO service_role; 