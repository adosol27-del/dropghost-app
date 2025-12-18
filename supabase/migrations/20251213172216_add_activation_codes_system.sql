/*
  # Add Activation Codes System

  1. New Tables
    - `activation_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - 6-digit activation code
      - `subscription_type` (text) - Type of subscription this code grants
      - `used` (boolean) - Whether the code has been used
      - `used_by` (uuid, nullable) - User who used the code
      - `used_at` (timestamptz, nullable) - When the code was used
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, nullable) - Optional expiration
      - `buyer_email` (text, nullable) - Email of the person who purchased

  2. Security
    - Enable RLS on activation_codes table
    - Users can only read codes they've used
    - Only authenticated users can attempt to use codes

  3. Functions
    - Function to generate random 6-digit code
    - Function to validate and use activation code
*/

-- Create activation_codes table
CREATE TABLE IF NOT EXISTS activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  subscription_type text NOT NULL CHECK (subscription_type IN ('daily', 'monthly_offer', 'monthly_standard')),
  used boolean DEFAULT false NOT NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  buyer_email text,
  CHECK (length(code) = 6)
);

-- Enable RLS
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view codes they used"
  ON activation_codes
  FOR SELECT
  TO authenticated
  USING (used_by = auth.uid());

-- Function to generate random 6-digit code
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate random 6-digit code
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM activation_codes WHERE code = new_code) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Function to create activation code after purchase
CREATE OR REPLACE FUNCTION create_activation_code(
  p_subscription_type text,
  p_buyer_email text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
BEGIN
  -- Generate unique code
  new_code := generate_activation_code();
  
  -- Insert the code
  INSERT INTO activation_codes (code, subscription_type, buyer_email)
  VALUES (new_code, p_subscription_type, p_buyer_email);
  
  RETURN new_code;
END;
$$;

-- Function to validate and use activation code
CREATE OR REPLACE FUNCTION use_activation_code(
  p_code text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record record;
  v_subscription_id uuid;
  v_expires_at timestamptz;
  v_price numeric;
  v_is_lifetime boolean;
BEGIN
  -- Get the code record
  SELECT * INTO v_code_record
  FROM activation_codes
  WHERE code = p_code
  FOR UPDATE;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Código inválido');
  END IF;
  
  -- Check if code is already used
  IF v_code_record.used THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este código ya ha sido utilizado');
  END IF;
  
  -- Check if code is expired
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este código ha expirado');
  END IF;
  
  -- Check if user already has an active subscription
  IF EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE user_id = p_user_id 
    AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya tienes una suscripción activa');
  END IF;
  
  -- Calculate price and expiration based on subscription type
  CASE v_code_record.subscription_type
    WHEN 'daily' THEN
      v_price := 1.99;
      v_expires_at := now() + interval '1 day';
      v_is_lifetime := false;
    WHEN 'monthly_offer' THEN
      v_price := 19.99;
      v_expires_at := NULL;
      v_is_lifetime := true;
    WHEN 'monthly_standard' THEN
      v_price := 29.99;
      v_expires_at := now() + interval '30 days';
      v_is_lifetime := false;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Tipo de suscripción inválido');
  END CASE;
  
  -- Create subscription
  INSERT INTO subscriptions (
    user_id,
    subscription_type,
    status,
    price,
    is_lifetime_offer,
    expires_at
  ) VALUES (
    p_user_id,
    v_code_record.subscription_type,
    'active',
    v_price,
    v_is_lifetime,
    v_expires_at
  ) RETURNING id INTO v_subscription_id;
  
  -- Mark code as used
  UPDATE activation_codes
  SET used = true,
      used_by = p_user_id,
      used_at = now()
  WHERE code = p_code;
  
  -- If it's a lifetime offer, increment the counter
  IF v_code_record.subscription_type = 'monthly_offer' THEN
    UPDATE subscription_stats
    SET lifetime_offer_count = lifetime_offer_count + 1,
        updated_at = now();
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'subscription_type', v_code_record.subscription_type
  );
END;
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_used ON activation_codes(used);