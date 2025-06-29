
-- Create a function to set the current gym owner context for RLS
CREATE OR REPLACE FUNCTION public.set_current_gym_owner_id(owner_id uuid)
RETURNS void AS $$
BEGIN
  -- Set the configuration parameter for the current session
  PERFORM set_config('app.current_gym_owner_id', owner_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
