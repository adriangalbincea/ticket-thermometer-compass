-- Drop the function with the extra parameter to resolve overloading ambiguity
DROP FUNCTION IF EXISTS public.create_feedback_link(text, text, text, text, text, integer, text);

-- Ensure we only have the original function without default_feedback_type
CREATE OR REPLACE FUNCTION public.create_feedback_link(
  p_ticket_number text, 
  p_technician text, 
  p_ticket_title text, 
  p_customer_email text DEFAULT NULL::text, 
  p_customer_name text DEFAULT NULL::text, 
  p_expires_hours integer DEFAULT 72
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  link_token TEXT;
BEGIN
  -- Generate a unique token using gen_random_uuid and replace hyphens
  link_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  
  -- Insert the feedback link
  INSERT INTO public.feedback_links (
    token,
    ticket_number,
    technician,
    ticket_title,
    customer_email,
    customer_name,
    expires_at
  ) VALUES (
    link_token,
    p_ticket_number,
    p_technician,
    p_ticket_title,
    p_customer_email,
    p_customer_name,
    now() + (p_expires_hours || ' hours')::INTERVAL
  );
  
  RETURN link_token;
END;
$function$;