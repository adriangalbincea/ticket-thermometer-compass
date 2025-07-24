-- Add user role restriction and ensure proper user access control
-- Create a function to check if a user has admin privileges
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to restrict access based on user roles
-- Only admins can access feedback_links table
DROP POLICY IF EXISTS "Admin can view all feedback links" ON public.feedback_links;
CREATE POLICY "Admin can view all feedback links" 
ON public.feedback_links 
FOR SELECT 
TO authenticated 
USING (is_admin());

DROP POLICY IF EXISTS "Admin can insert feedback links" ON public.feedback_links;
CREATE POLICY "Admin can insert feedback links" 
ON public.feedback_links 
FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

-- Only admins can access feedback_submissions table
DROP POLICY IF EXISTS "Admin can view all feedback submissions" ON public.feedback_submissions;
CREATE POLICY "Admin can view all feedback submissions" 
ON public.feedback_submissions 
FOR SELECT 
TO authenticated 
USING (is_admin());

-- Allow public to insert feedback submissions (for the feedback form)
DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedback_submissions;
CREATE POLICY "Public can submit feedback" 
ON public.feedback_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (is_admin());

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Only admins can update profiles
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
CREATE POLICY "Admin can update profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (is_admin());

-- Admins can insert profiles
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
CREATE POLICY "Admin can insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());