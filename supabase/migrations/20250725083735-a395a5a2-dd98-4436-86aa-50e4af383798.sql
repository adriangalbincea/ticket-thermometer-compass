-- Remove obsolete SMTP settings since we're using Mailchimp API now
DELETE FROM public.email_settings WHERE setting_type = 'smtp';