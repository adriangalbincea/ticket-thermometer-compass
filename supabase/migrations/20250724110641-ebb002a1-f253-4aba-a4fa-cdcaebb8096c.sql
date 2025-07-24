-- Update RLS policies to allow normal users to view feedback data and create feedback links

-- Update feedback_submissions table policies to allow authenticated users to view data
DROP POLICY IF EXISTS "Users can view feedback submissions for analytics" ON public.feedback_submissions;
CREATE POLICY "Users can view feedback submissions for analytics" 
ON public.feedback_submissions 
FOR SELECT 
TO authenticated
USING (true);

-- Update feedback_links table policies to allow authenticated users to insert and view their own links
DROP POLICY IF EXISTS "Users can create feedback links" ON public.feedback_links;
CREATE POLICY "Users can create feedback links" 
ON public.feedback_links 
FOR INSERT 
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view feedback links" ON public.feedback_links;
CREATE POLICY "Users can view feedback links" 
ON public.feedback_links 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update feedback links" ON public.feedback_links;
CREATE POLICY "Users can update feedback links" 
ON public.feedback_links 
FOR UPDATE 
TO authenticated
USING (true);