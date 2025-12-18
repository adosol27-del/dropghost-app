/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database audit:

  ## 1. Indexes
  - Add missing index on `activation_codes.used_by` foreign key for better join performance
  - Drop redundant `idx_videos_week_start_date` (covered by composite index)
  
  ## 2. RLS Policy Optimization
  Fix all RLS policies to use `(select auth.uid())` pattern instead of `auth.uid()` to prevent
  re-evaluation on every row. This significantly improves query performance at scale.
  
  Affected tables and policies:
  - `videos`: INSERT, UPDATE, DELETE policies
  - `subscriptions`: SELECT, INSERT, UPDATE policies
  - `activation_codes`: SELECT policy
  - `user_profiles`: SELECT policy
  - `video_favorites`: All policies
  - `product_requests`: All policies
  
  ## 3. Policy Consolidation
  Merge multiple permissive policies where appropriate:
  - `video_favorites`: Consolidate two SELECT policies into one
  - `user_profiles`: Simplify by removing redundant policy
  
  ## 4. Function Security
  Add explicit search_path to all functions to prevent search_path hijacking attacks:
  - `update_updated_at_column`
  - `create_activation_code`
  - `handle_new_user`
  - `is_lifetime_offer_available`
  - `increment_lifetime_offer_count`
  - `generate_activation_code`
  - `use_activation_code`
  
  ## Notes
  - Some indexes marked as "unused" are kept because they're important for query optimization
    as the application scales (e.g., subscriptions status, expiration dates, activation codes)
  - Auth DB connection strategy and password leak protection require Supabase dashboard configuration
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES
-- ============================================================================

-- Add index for activation_codes.used_by foreign key
CREATE INDEX IF NOT EXISTS idx_activation_codes_used_by ON activation_codes(used_by);

-- ============================================================================
-- 2. DROP REDUNDANT INDEXES
-- ============================================================================

-- Drop idx_videos_week_start_date as it's covered by idx_videos_week_day_order composite index
DROP INDEX IF EXISTS idx_videos_week_start_date;

-- ============================================================================
-- 3. FIX RLS POLICIES - VIDEOS TABLE
-- ============================================================================

-- Drop and recreate videos policies with optimized auth.uid() pattern
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. FIX RLS POLICIES - SUBSCRIPTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 5. FIX RLS POLICIES - ACTIVATION_CODES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view codes they used" ON activation_codes;

CREATE POLICY "Users can view codes they used"
  ON activation_codes FOR SELECT
  TO authenticated
  USING (used_by = (select auth.uid()));

-- ============================================================================
-- 6. FIX RLS POLICIES - USER_PROFILES TABLE
-- ============================================================================

-- Drop redundant policy and keep only the permissive one
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;

-- Recreate with optimized pattern - single policy that allows all authenticated users
CREATE POLICY "Users can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 7. FIX RLS POLICIES - VIDEO_FAVORITES TABLE
-- ============================================================================

-- Consolidate two SELECT policies into one comprehensive policy
DROP POLICY IF EXISTS "Users can view their own favorites" ON video_favorites;
DROP POLICY IF EXISTS "Users can view favorite counts" ON video_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON video_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON video_favorites;

-- Allow authenticated users to view all favorites (needed for counts)
CREATE POLICY "Users can view favorites"
  ON video_favorites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add favorites"
  ON video_favorites FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON video_favorites FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 8. FIX RLS POLICIES - PRODUCT_REQUESTS TABLE
-- ============================================================================

-- Consolidate and optimize product_requests policies
DROP POLICY IF EXISTS "Users can create their own product requests" ON product_requests;
DROP POLICY IF EXISTS "Users can read their own product requests" ON product_requests;
DROP POLICY IF EXISTS "Admins can read all product requests" ON product_requests;
DROP POLICY IF EXISTS "Admins can update product requests" ON product_requests;

CREATE POLICY "Users can create their own product requests"
  ON product_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Consolidated SELECT policy: users see their own, admins see all
CREATE POLICY "Users can read product requests"
  ON product_requests FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id 
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update product requests"
  ON product_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 9. FIX FUNCTION SECURITY - ADD EXPLICIT SEARCH_PATH
-- ============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

-- Fix is_lifetime_offer_available function
CREATE OR REPLACE FUNCTION is_lifetime_offer_available()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- Fix increment_lifetime_offer_count function
CREATE OR REPLACE FUNCTION increment_lifetime_offer_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE subscription_stats
  SET lifetime_offer_count = lifetime_offer_count + 1,
      updated_at = now();
END;
$$;

-- Fix generate_activation_code function
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- Fix create_activation_code function
CREATE OR REPLACE FUNCTION create_activation_code(
  p_subscription_type text,
  p_buyer_email text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- Fix use_activation_code function
CREATE OR REPLACE FUNCTION use_activation_code(
  p_code text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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