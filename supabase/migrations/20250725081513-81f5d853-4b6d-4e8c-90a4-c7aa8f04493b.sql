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