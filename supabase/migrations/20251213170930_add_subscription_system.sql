/*
  # Add Subscription System

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `subscription_type` (text) - 'daily', 'monthly_offer', 'monthly_standard'
      - `status` (text) - 'active', 'expired', 'cancelled'
      - `price` (numeric) - The price paid
      - `stripe_session_id` (text) - Stripe session identifier
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - For daily subscriptions
      - `is_lifetime_offer` (boolean) - True for the 50 first users at 19.99€
    
    - `subscription_stats`
      - `id` (uuid, primary key)
      - `lifetime_offer_count` (integer) - Count of users with lifetime offer
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read their own subscription data
    - Only authenticated users can access
    - System functions for managing subscription counts

  3. Functions
    - Function to check if lifetime offer is still available
    - Function to increment lifetime offer count
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_type text NOT NULL CHECK (subscription_type IN ('daily', 'monthly_offer', 'monthly_standard')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  price numeric(10,2) NOT NULL,
  stripe_session_id text,
  is_lifetime_offer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id)
);

-- Create subscription stats table
CREATE TABLE IF NOT EXISTS subscription_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lifetime_offer_count integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Initialize subscription stats
INSERT INTO subscription_stats (lifetime_offer_count)
VALUES (0)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_stats (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view subscription stats"
  ON subscription_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to check if lifetime offer is available
CREATE OR REPLACE FUNCTION is_lifetime_offer_available()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT lifetime_offer_count INTO current_count
  FROM subscription_stats
  LIMIT 1;
  
  RETURN current_count < 50;
END;
$$;

-- Function to increment lifetime offer count
CREATE OR REPLACE FUNCTION increment_lifetime_offer_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE subscription_stats
  SET lifetime_offer_count = lifetime_offer_count + 1,
      updated_at = now();
END;
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);