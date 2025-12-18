/*
  # Optimize Unused Indexes

  ## Analysis and Actions
  
  After reviewing query patterns and application needs, this migration optimizes the index strategy:

  ### Indexes to KEEP (Critical for Performance)
  
  1. **idx_activation_codes_code** - KEEP
     - Used in `use_activation_code()` function with WHERE clause
     - Critical for code validation performance
     - High lookup frequency expected
  
  2. **idx_subscriptions_status** - KEEP
     - Used to filter active/expired subscriptions
     - Critical for subscription validation queries
     - Prevents full table scans
  
  3. **idx_subscriptions_expires_at** - KEEP
     - Used for expiration checks and cleanup jobs
     - Will be critical for automated expiration processes
     - Date range queries benefit significantly from this index

  ### Indexes to DROP (Not Currently Beneficial)
  
  1. **idx_activation_codes_used** - DROP
     - Boolean column index has low selectivity
     - Most queries use the code directly (indexed)
     - Not worth the write overhead
  
  2. **idx_activation_codes_used_by** - DROP
     - Foreign key but low read frequency
     - Users typically query by code, not by who used it
     - The join performance impact is minimal for this use case
  
  3. **idx_product_requests_user_id** - DROP
     - RLS policies filter by user_id automatically
     - Sequential scans acceptable given expected low volume per user
     - Foreign key constraint provides sufficient integrity
  
  4. **idx_product_requests_status** - DROP
     - Low cardinality (only 3 status values)
     - Admin queries are infrequent
     - Not worth the write overhead for rare admin filtering

  ## Performance Impact
  
  - Reduced index maintenance overhead on INSERT/UPDATE operations
  - Minimal impact on query performance (dropped indexes had low benefit)
  - Maintained critical indexes for high-frequency lookups

  ## Notes
  
  Two configuration items require Supabase Dashboard changes:
  1. **Auth DB Connection Strategy**: Navigate to Project Settings > Database > Connection Pooling
     and switch from fixed connection count to percentage-based allocation
  2. **Leaked Password Protection**: Navigate to Authentication > Providers > Email
     and enable "Check for compromised passwords" using HaveIBeenPwned integration
*/

-- Drop indexes that provide minimal benefit for their maintenance cost
DROP INDEX IF EXISTS idx_activation_codes_used;
DROP INDEX IF EXISTS idx_activation_codes_used_by;
DROP INDEX IF EXISTS idx_product_requests_user_id;
DROP INDEX IF EXISTS idx_product_requests_status;

-- Keep these critical indexes (documenting for clarity):
-- - idx_activation_codes_code (code lookups in use_activation_code function)
-- - idx_subscriptions_status (active subscription filtering)
-- - idx_subscriptions_expires_at (expiration checks and cleanup jobs)