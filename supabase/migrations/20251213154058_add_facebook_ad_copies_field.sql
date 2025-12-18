/*
  # Add Facebook Ad Copies Field
  
  ## Overview
  Adds a new field to store 5 different Facebook Ad copy variations
  based on different sales angles for each product.
  
  ## Changes
  
  1. New Column
    - `facebook_ad_copies` (jsonb array) - Stores 5 different ad copy texts
      * Each copy uses a different sales angle:
        1. Problema/Solución (Pain Point)
        2. Transformación (Antes y Después)
        3. Escasez/Urgencia (FOMO)
        4. Propuesta de Valor Única
        5. Desafío o Pregunta Impactante
      * Default is an empty array
  
  ## Notes
  - Allows marketers to test different ad copy approaches
  - Each angle targets different psychological triggers
  - Helps optimize Facebook Ad campaigns with varied messaging
*/

-- Add facebook_ad_copies column to videos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'facebook_ad_copies'
  ) THEN
    ALTER TABLE videos ADD COLUMN facebook_ad_copies jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;