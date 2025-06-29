
-- Create storage bucket for gig images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gig-images',
  'gig-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for gig images
CREATE POLICY "Users can upload gig images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gig-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view gig images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gig-images');

CREATE POLICY "Users can update their own gig images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gig-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own gig images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gig-images' AND
  auth.uid() IS NOT NULL
);

-- Add view count and order count to gigs table
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0;

-- Add function to increment view count
CREATE OR REPLACE FUNCTION increment_gig_views(gig_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE gigs 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = gig_id;
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gigs_status_created ON gigs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category);
