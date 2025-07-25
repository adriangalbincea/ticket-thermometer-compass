-- Add default_feedback_type column to feedback_links table
ALTER TABLE public.feedback_links 
ADD COLUMN default_feedback_type TEXT CHECK (default_feedback_type IN ('bad', 'neutral', 'happy'));

-- Update the create_feedback_link function to accept default_feedback_type parameter
CREATE OR REPLACE FUNCTION public.create_feedback_link(
  p_ticket_number text, 
  p_technician text, 
  p_ticket_title text, 
  p_customer_email text DEFAULT NULL::text, 
  p_customer_name text DEFAULT NULL::text, 
  p_expires_hours integer DEFAULT 72,
  p_default_feedback_type text DEFAULT NULL::text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  link_token TEXT;
BEGIN
  -- Validate default_feedback_type if provided
  IF p_default_feedback_type IS NOT NULL AND p_default_feedback_type NOT IN ('bad', 'neutral', 'happy') THEN
    RAISE EXCEPTION 'Invalid feedback type. Must be one of: bad, neutral, happy';
  END IF;

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
    expires_at,
    default_feedback_type
  ) VALUES (
    link_token,
    p_ticket_number,
    p_technician,
    p_ticket_title,
    p_customer_email,
    p_customer_name,
    now() + (p_expires_hours || ' hours')::INTERVAL,
    p_default_feedback_type
  );
  
  RETURN link_token;
END;
$function$;