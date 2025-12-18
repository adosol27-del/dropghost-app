/*
  # Make Storage Buckets Public for Content Display
  
  ## Changes
  
  1. Storage Buckets
    - Update `videos` bucket to be public
    - Update `images` bucket to be public
    - This allows getPublicUrl() to work properly for displaying content
  
  2. Security Notes
    - Buckets are public for READ access (viewing content)
    - Upload/Delete policies still require authentication
    - Users can only upload/delete their own files
    - All authenticated users can view all content
*/

-- Make videos bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'videos';

-- Make images bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'images';

-- Drop old restrictive SELECT policies
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;

-- Create new public SELECT policies for viewing content
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');