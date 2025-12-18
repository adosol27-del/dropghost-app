/*
  # Add Sales Angles Field
  
  ## Overview
  Adds a new field to store 5 different sales angles for each product.
  Sales angles are different marketing perspectives or value propositions
  that can be used to promote the product.
  
  ## Changes
  
  1. New Column
    - `sales_angles` (jsonb array) - Stores 5 different sales angles for the product
      * Each angle is a text string describing a unique selling proposition
      * Default is an empty array
  
  ## Notes
  - This field allows storing multiple marketing angles for better content strategy
  - Each product can have up to 5 different angles to appeal to different audiences
*/

-- Add sales_angles column to videos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'sales_angles'
  ) THEN
    ALTER TABLE videos ADD COLUMN sales_angles jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;