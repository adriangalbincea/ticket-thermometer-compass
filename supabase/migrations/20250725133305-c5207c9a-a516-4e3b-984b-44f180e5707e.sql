-- Create storage bucket for generated emojis
INSERT INTO storage.buckets (id, name, public) VALUES ('emojis', 'emojis', true);

-- Create policies for emoji storage
CREATE POLICY "Anyone can view emojis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'emojis');

CREATE POLICY "Anyone can upload emojis" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'emojis');

CREATE POLICY "Anyone can update emojis" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'emojis');

CREATE POLICY "Anyone can delete emojis" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'emojis');