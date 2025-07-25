-- Drop the existing function to recreate with IP parameter
DROP FUNCTION IF EXISTS public.is_2fa_required(user_id uuid);

-- Create updated 2FA requirement function that considers IP whitelist
CREATE OR REPLACE FUNCTION public.is_2fa_required_with_ip(user_id uuid, user_ip text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role TEXT;
  two_factor_enabled BOOLEAN := false;
  ip_inet inet;
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
    
    -- If 2FA is enabled, check if IP is whitelisted
    IF COALESCE(two_factor_enabled, false) THEN
      -- If IP is provided, try to convert and check whitelist
      IF user_ip IS NOT NULL AND user_ip != '' THEN
        BEGIN
          ip_inet := user_ip::inet;
          -- If IP is whitelisted, bypass 2FA
          IF is_ip_whitelisted(ip_inet) THEN
            RETURN false;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Invalid IP format, continue with 2FA requirement
          NULL;
        END;
      END IF;
      
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$function$

-- Keep the original function for backwards compatibility
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