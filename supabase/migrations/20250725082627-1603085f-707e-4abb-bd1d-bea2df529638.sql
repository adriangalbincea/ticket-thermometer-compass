-- Remove IP whitelist functionality
DROP FUNCTION IF EXISTS public.is_ip_whitelisted(user_ip inet);
DROP FUNCTION IF EXISTS public.is_2fa_required_with_ip(user_id uuid, user_ip text);