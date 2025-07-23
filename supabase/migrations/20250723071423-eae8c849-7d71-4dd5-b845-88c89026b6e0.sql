-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_feedback_link(
  p_ticket_number TEXT,
  p_technician TEXT,
  p_ticket_title TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_expires_hours INTEGER DEFAULT 72
)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  link_token TEXT;
BEGIN
  -- Generate a unique token
  link_token := encode(gen_random_bytes(32), 'base64url');
  
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