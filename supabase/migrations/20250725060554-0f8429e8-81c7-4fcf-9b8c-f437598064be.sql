-- Create email_settings table for storing SMTP and email template configurations
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_type TEXT NOT NULL, -- 'smtp' or 'template'
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(setting_type, setting_key)
);

-- Enable Row Level Security
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage email settings
CREATE POLICY "Admins can manage email settings" 
ON public.email_settings 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();