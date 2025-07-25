-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to clean up expired, unused feedback links
CREATE OR REPLACE FUNCTION public.cleanup_expired_feedback_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  DELETE FROM public.feedback_links
  WHERE expires_at < now()
    AND is_used = false;
  
  -- Log the cleanup action
  RAISE NOTICE 'Cleaned up expired, unused feedback links at %', now();
END;
$function$;

-- Schedule the cleanup to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-expired-feedback-links',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT public.cleanup_expired_feedback_links();'
);