-- Restore the original is_2fa_required function that other parts depend on
CREATE OR REPLACE FUNCTION public.is_2fa_required(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role TEXT;
  two_factor_enabled BOOLEAN := false;
BEGIN
  -- Get user role
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Check if 2FA is enabled in settings for admin users
  IF user_role = 'admin' THEN
    SELECT setting_value::boolean INTO two_factor_enabled
    FROM public.app_settings 
    WHERE setting_key = 'two_factor_auth';
  END IF;
  
  RETURN COALESCE(two_factor_enabled, false);
END;
$function$