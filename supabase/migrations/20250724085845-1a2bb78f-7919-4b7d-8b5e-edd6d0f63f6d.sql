-- Fix gen_random_bytes function issue by updating the create_feedback_link function
CREATE OR REPLACE FUNCTION public.create_feedback_link(p_ticket_number text, p_technician text, p_ticket_title text, p_customer_email text DEFAULT NULL::text, p_customer_name text DEFAULT NULL::text, p_expires_hours integer DEFAULT 72)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $$
DECLARE
  link_token TEXT;
BEGIN
  -- Generate a unique token using crypto extension
  link_token := encode(digest(random()::text || clock_timestamp()::text, 'sha256'), 'base64url');
  
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
$$;