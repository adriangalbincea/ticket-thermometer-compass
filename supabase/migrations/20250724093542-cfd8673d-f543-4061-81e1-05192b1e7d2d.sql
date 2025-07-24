-- Create webhooks configuration table
CREATE TABLE public.webhook_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_url TEXT,
  secret_key TEXT,
  enabled BOOLEAN DEFAULT false,
  events TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage webhooks
CREATE POLICY "Admins can manage webhook config" 
ON public.webhook_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Create settings table
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage settings
CREATE POLICY "Admins can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_webhook_config_updated_at
BEFORE UPDATE ON public.webhook_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();