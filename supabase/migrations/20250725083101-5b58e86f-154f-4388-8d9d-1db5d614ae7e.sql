-- Remove IP whitelist settings from app_settings
DELETE FROM public.app_settings WHERE setting_key IN ('ip_whitelist', 'ip_whitelist_addresses');