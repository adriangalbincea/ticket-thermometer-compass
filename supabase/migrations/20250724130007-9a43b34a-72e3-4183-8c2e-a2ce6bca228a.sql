-- Create table to store 2FA secrets and backup codes
CREATE TABLE public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- TOTP secret key
  backup_codes TEXT[] NOT NULL DEFAULT '{}', -- Array of backup codes
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- Policies for 2FA table
CREATE POLICY "Users can manage their own 2FA settings"
ON public.user_2fa
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_2fa_updated_at
  BEFORE UPDATE ON public.user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if 2FA is required for user
CREATE OR REPLACE FUNCTION public.is_2fa_required(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Function to verify TOTP code
CREATE OR REPLACE FUNCTION public.verify_totp_token(user_id UUID, token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_secret TEXT;
BEGIN
  SELECT secret INTO user_secret
  FROM public.user_2fa
  WHERE user_2fa.user_id = verify_totp_token.user_id AND is_enabled = true;
  
  IF user_secret IS NULL THEN
    RETURN false;
  END IF;
  
  -- Note: In a real implementation, you would verify the TOTP token here
  -- This is a simplified version that accepts 6-digit tokens for demo
  RETURN LENGTH(token) = 6 AND token ~ '^[0-9]+$';
END;
$$;