/*
  # Add Product Metrics Fields to Videos Table

  ## Changes
  This migration adds comprehensive product metrics fields to the videos table
  to support the Studio Creator dashboard workflow.

  ### New Fields Added
  - `country` (text) - Country where product is selling
  - `product_name` (text) - Name of the product
  - `ranking_us` (int) - US ranking position
  - `ranking_category` (int) - Category ranking position
  - `per_product` (numeric) - Per product metric value
  - `per_global` (numeric) - Global metric value
  - `sales_yesterday` (text) - Sales from yesterday (e.g., "1.2mil")
  - `sales_7_days` (text) - Sales from last 7 days (e.g., "15.4mil")
  - `total_sales` (text) - Total sales (e.g., "513.2mil")
  - `total_gmv` (text) - Total GMV value (e.g., "$12.9millón")
  - `impressions` (text) - Total impressions (e.g., "9.2mil")
  - `video_count` (text) - Number of videos (e.g., "7.2mil")
  - `product_image_url` (text) - URL for product lens image
  - `sales_image_url` (text) - URL for sales capture/graph
  - `store_link` (text) - AliExpress or web store URL
  - `publication_date` (date) - Scheduled publication date

  ## Notes
  - Uses text for numeric values with units (mil, millón) for flexible display
  - All new fields are optional (nullable) for backwards compatibility
*/

-- Add product metrics fields to videos table
DO $$
BEGIN
  -- Country field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'country'
  ) THEN
    ALTER TABLE videos ADD COLUMN country text DEFAULT '';
  END IF;

  -- Product name field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE videos ADD COLUMN product_name text DEFAULT '';
  END IF;

  -- Ranking US field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'ranking_us'
  ) THEN
    ALTER TABLE videos ADD COLUMN ranking_us int;
  END IF;

  -- Ranking Category field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'ranking_category'
  ) THEN
    ALTER TABLE videos ADD COLUMN ranking_category int;
  END IF;

  -- Per Product field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'per_product'
  ) THEN
    ALTER TABLE videos ADD COLUMN per_product numeric;
  END IF;

  -- Per Global field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'per_global'
  ) THEN
    ALTER TABLE videos ADD COLUMN per_global numeric;
  END IF;

  -- Sales yesterday field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'sales_yesterday'
  ) THEN
    ALTER TABLE videos ADD COLUMN sales_yesterday text DEFAULT '';
  END IF;

  -- Sales 7 days field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'sales_7_days'
  ) THEN
    ALTER TABLE videos ADD COLUMN sales_7_days text DEFAULT '';
  END IF;

  -- Total sales field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'total_sales'
  ) THEN
    ALTER TABLE videos ADD COLUMN total_sales text DEFAULT '';
  END IF;

  -- Total GMV field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'total_gmv'
  ) THEN
    ALTER TABLE videos ADD COLUMN total_gmv text DEFAULT '';
  END IF;

  -- Impressions field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'impressions'
  ) THEN
    ALTER TABLE videos ADD COLUMN impressions text DEFAULT '';
  END IF;

  -- Video count field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'video_count'
  ) THEN
    ALTER TABLE videos ADD COLUMN video_count text DEFAULT '';
  END IF;

  -- Product image URL field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'product_image_url'
  ) THEN
    ALTER TABLE videos ADD COLUMN product_image_url text DEFAULT '';
  END IF;

  -- Sales image URL field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'sales_image_url'
  ) THEN
    ALTER TABLE videos ADD COLUMN sales_image_url text DEFAULT '';
  END IF;

  -- Store link field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'store_link'
  ) THEN
    ALTER TABLE videos ADD COLUMN store_link text DEFAULT '';
  END IF;

  -- Publication date field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'publication_date'
  ) THEN
    ALTER TABLE videos ADD COLUMN publication_date date;
  END IF;
END $$;