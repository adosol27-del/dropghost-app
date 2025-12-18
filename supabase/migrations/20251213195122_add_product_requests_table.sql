/*
  # Add Product Requests System

  1. New Tables
    - `product_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text) - email del usuario que hace la solicitud
      - `message` (text) - mensaje con la descripción del producto
      - `status` (text) - estado: 'pending', 'reviewing', 'completed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `admin_notes` (text) - notas del administrador
  
  2. Security
    - Enable RLS on `product_requests` table
    - Add policy for users to create their own requests
    - Add policy for users to read their own requests
    - Add policy for admins to read all requests
    - Add policy for admins to update requests
*/

CREATE TABLE IF NOT EXISTS product_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  admin_notes text
);

ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own product requests"
  ON product_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own product requests"
  ON product_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all product requests"
  ON product_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update product requests"
  ON product_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_requests_user_id ON product_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_created_at ON product_requests(created_at DESC);