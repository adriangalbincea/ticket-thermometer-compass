-- Create feedback_links table for unique auto-destroying links
CREATE TABLE public.feedback_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  ticket_number TEXT NOT NULL,
  technician TEXT NOT NULL,
  ticket_title TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_submissions table to store actual feedback
CREATE TABLE public.feedback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_link_id UUID REFERENCES public.feedback_links(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bad', 'neutral', 'happy')),
  comment TEXT,
  customer_ip TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback_links (admin access only)
CREATE POLICY "Admins can manage feedback links" 
ON public.feedback_links 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for feedback_submissions (admin can view, anyone can insert with valid link)
CREATE POLICY "Admins can view all feedback submissions" 
ON public.feedback_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Anyone can submit feedback with valid link" 
ON public.feedback_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feedback_links 
    WHERE id = feedback_link_id 
    AND is_used = false 
    AND expires_at > now()
  )
);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Profiles are created automatically" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_feedback_links_updated_at
BEFORE UPDATE ON public.feedback_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate unique feedback link
CREATE OR REPLACE FUNCTION public.create_feedback_link(
  p_ticket_number TEXT,
  p_technician TEXT,
  p_ticket_title TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_expires_hours INTEGER DEFAULT 72
)
RETURNS TEXT AS $$
DECLARE
  link_token TEXT;
BEGIN
  -- Generate a unique token
  link_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Insert the feedback link
  INSERT INTO public.feedback_links (
    token,
    ticket_number,
    technician,
    ticket_title,
    customer_email,
    customer_name,
    expires_at
  ) VALUES (
    link_token,
    p_ticket_number,
    p_technician,
    p_ticket_title,
    p_customer_email,
    p_customer_name,
    now() + (p_expires_hours || ' hours')::INTERVAL
  );
  
  RETURN link_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;