-- Remove reminder email template settings
DELETE FROM public.email_settings WHERE setting_key IN ('reminder_subject', 'reminder_html');