-- Create monitoring role and notification_recipients table
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'monitoring');

-- Update user role to use the new enum (if not already done)
-- First, add the new value to existing role column if it's a text column
-- We'll handle this by adding a constraint to allow the new role

-- Create notification recipients table for feedback notifications
CREATE TABLE public.notification_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification recipients
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Create policies for notification recipients
CREATE POLICY "Admins can manage notification recipients" 
ON public.notification_recipients 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates on notification_recipients
CREATE TRIGGER update_notification_recipients_updated_at
BEFORE UPDATE ON public.notification_recipients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to support the monitoring role
-- Since we can't easily modify enum types, we'll use a text column with a check constraint
-- First, let's check if the role column is already text and update the constraint

-- Add check constraint to allow monitoring role if not already present
DO $$
BEGIN
  -- Drop existing constraint if it exists
  BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  -- Add new constraint that includes monitoring role
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'user', 'monitoring'));
END $$;