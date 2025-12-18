/*
  # Update Video Visibility and Add Favorites System

  1. Changes to Videos Table
    - Update RLS policy to allow all authenticated users to view all videos
    - Keep existing policies for insert, update, and delete (only owners)

  2. New Tables
    - `video_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `video_id` (uuid, references videos)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, video_id) to prevent duplicate favorites
  
  3. Security
    - Enable RLS on `video_favorites` table
    - Users can view their own favorites
    - Users can insert their own favorites
    - Users can delete their own favorites
    - Users can view favorite counts for any video
*/

DROP POLICY IF EXISTS "Users can view their own videos" ON public.videos;

CREATE POLICY "All authenticated users can view all videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.video_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.video_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.video_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view favorite counts"
  ON public.video_favorites
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add favorites"
  ON public.video_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.video_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_video_favorites_user_id ON public.video_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_video_favorites_video_id ON public.video_favorites(video_id);