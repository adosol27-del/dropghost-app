-- Script para verificar si hay store_links en la base de datos

-- Ver todos los videos y sus store_links
SELECT
  id,
  product_name,
  store_link,
  CASE
    WHEN store_link IS NULL THEN 'NULL'
    WHEN store_link = '' THEN 'VACIO'
    ELSE 'TIENE VALOR'
  END as estado_store_link
FROM videos
ORDER BY publication_date DESC;

-- Contar cuántos videos tienen store_link
SELECT
  COUNT(*) as total_videos,
  SUM(CASE WHEN store_link IS NOT NULL AND store_link != '' THEN 1 ELSE 0 END) as con_store_link,
  SUM(CASE WHEN store_link IS NULL OR store_link = '' THEN 1 ELSE 0 END) as sin_store_link
FROM videos;
