-- Create function to check if IP is whitelisted
CREATE OR REPLACE FUNCTION public.is_ip_whitelisted(user_ip inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  ip_whitelist_enabled BOOLEAN := false;
  whitelist_addresses TEXT := '';
  ip_line TEXT;
BEGIN
  -- Check if IP whitelist is enabled
  SELECT setting_value::boolean INTO ip_whitelist_enabled
  FROM public.app_settings 
  WHERE setting_key = 'ip_whitelist';
  
  -- If IP whitelist is not enabled, return true (allow all IPs)
  IF NOT COALESCE(ip_whitelist_enabled, false) THEN
    RETURN true;
  END IF;
  
  -- Get the whitelist addresses
  SELECT setting_value INTO whitelist_addresses
  FROM public.app_settings 
  WHERE setting_key = 'ip_whitelist_addresses';
  
  -- If no addresses configured, return false for security
  IF whitelist_addresses IS NULL OR whitelist_addresses = '' THEN
    RETURN false;
  END IF;
  
  -- Check if the user IP is in the whitelist
  -- Split by newlines and check each IP
  FOR ip_line IN SELECT unnest(string_to_array(whitelist_addresses, E'\n'))
  LOOP
    -- Trim whitespace
    ip_line := trim(ip_line);
    
    -- Skip empty lines
    IF ip_line = '' THEN
      CONTINUE;
    END IF;
    
    -- Try to match the IP (exact match for now)
    BEGIN
      IF user_ip = ip_line::inet THEN
        RETURN true;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Invalid IP format, skip
      CONTINUE;
    END;
  END LOOP;
  
  RETURN false;
END;
$function$

-- Update the 2FA requirement function to consider IP whitelist
CREATE OR REPLACE FUNCTION public.is_2fa_required(user_id uuid, user_ip inet DEFAULT NULL)
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
    
    -- If 2FA is enabled, check if IP is whitelisted
    IF COALESCE(two_factor_enabled, false) THEN
      -- If IP is provided and whitelisted, bypass 2FA
      IF user_ip IS NOT NULL AND is_ip_whitelisted(user_ip) THEN
        RETURN false;
      END IF;
      
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$function$