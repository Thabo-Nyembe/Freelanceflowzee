-- Fix user signup trigger issue
-- This drops the problematic trigger that references tables with wrong schema

DROP TRIGGER IF EXISTS trigger_create_default_user_settings ON auth.users;
DROP FUNCTION IF EXISTS create_default_user_settings();

-- Recreate a simpler version that works with existing table structure
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles with just user_id (other columns have defaults)
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert into notification_settings
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert into security_settings
  INSERT INTO security_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert into appearance_settings  
  INSERT INTO appearance_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't fail user creation
    RAISE WARNING 'Error in create_default_user_settings: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER trigger_create_default_user_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();
