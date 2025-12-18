/*
  # Dashboard de Videos Diarios E-commerce - Database Schema

  ## Overview
  This migration creates the database structure for a daily video content management dashboard
  where users can upload and manage 5+ vertical videos per day (Monday-Friday) with associated
  metadata including descriptions, images, sales metrics, and external URLs.

  ## New Tables
  
  ### `videos`
  Stores all video content and metadata for the e-commerce dashboard
  - `id` (uuid, primary key) - Unique identifier for each video
  - `created_at` (timestamptz) - Timestamp when video was created
  - `updated_at` (timestamptz) - Timestamp of last update
  - `week_start_date` (date) - Monday date of the week this video belongs to
  - `day_of_week` (int) - Day index: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday
  - `order_in_day` (int) - Order position within the day (1-5+)
  - `video_url` (text) - Storage path/URL to the video file
  - `title` (text) - Title of the video content
  - `description` (text) - Editable descriptive text for the video
  - `image_url` (text) - Storage path/URL to associated image/graph
  - `sales_summary` (text) - Sales metrics and summary information
  - `external_urls` (jsonb) - Array of external links (suppliers, stores, products)
  - `user_id` (uuid) - Reference to auth.users for multi-user support

  ## Storage Buckets
  
  ### `videos`
  Stores uploaded video files (vertical format)
  
  ### `images`
  Stores uploaded images, charts, and graphics
  
  ## Security
  
  - Enable RLS on `videos` table
  - Authenticated users can manage their own videos
  - Storage buckets require authentication
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
  
  ## Indexes
  
  - Index on `week_start_date` for efficient weekly queries
  - Index on `user_id` for user-specific filtering
  - Composite index on `week_start_date, day_of_week, order_in_day` for sorting
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  week_start_date date NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 4),
  order_in_day int NOT NULL DEFAULT 1,
  video_url text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT '',
  sales_summary text DEFAULT '',
  external_urls jsonb DEFAULT '[]'::jsonb,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_week_start_date ON videos(week_start_date);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_week_day_order ON videos(week_start_date, day_of_week, order_in_day);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos table
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for images bucket
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();