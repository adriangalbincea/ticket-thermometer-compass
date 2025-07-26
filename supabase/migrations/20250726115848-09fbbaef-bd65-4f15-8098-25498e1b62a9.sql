-- Allow unauthenticated users to read feedback links for validation
CREATE POLICY "Allow unauthenticated access to feedback links" 
ON public.feedback_links 
FOR SELECT 
USING (true);