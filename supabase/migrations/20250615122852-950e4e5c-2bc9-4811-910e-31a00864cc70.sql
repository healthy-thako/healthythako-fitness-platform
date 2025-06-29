
-- First, let's check if the foreign key exists and create it if missing
-- The gigs table has trainer_id which should reference trainer_profiles.user_id
-- Let's add the proper foreign key constraint
ALTER TABLE gigs 
ADD CONSTRAINT fk_gigs_trainer_id 
FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(user_id);

-- Also ensure we have the proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_gigs_trainer_id ON gigs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_profiles_user_id ON trainer_profiles(user_id);
