# Verificar Botón del Proveedor

## Cambios Realizados

He actualizado el componente `UserLibrary.tsx` para:

1. **Añadir el botón de tienda/proveedor** con icono de bolsa de compras (ShoppingBag)
2. **Añadir debugging automático** - La consola del navegador mostrará información sobre cada video
3. **Condición correcta** - El botón solo aparece si `store_link` tiene un valor real (no vacío)

## Cómo Verificar

### 1. Abrir la Biblioteca de Videos

Abre la aplicación y ve a la biblioteca de videos (página del usuario)

### 2. Abrir la Consola del Navegador

Presiona `F12` o `Cmd+Option+I` (Mac) para abrir las herramientas de desarrollo.

Ve a la pestaña "Console" (Consola)

### 3. Revisar el Debug Log

Deberías ver algo como esto:

```
=== DEBUG: Videos en biblioteca ===
Video 1: "Nombre del Producto"
  - store_link: "https://ejemplo.com/tienda"
  - tiene store_link: true

Video 2: "Otro Producto"
  - store_link: ""
  - tiene store_link: false
```

### 4. Interpretar los Resultados

- **Si `store_link` muestra una URL válida** → El botón debería aparecer en esa tarjeta
- **Si `store_link` muestra `""` (vacío)** → El botón NO aparecerá (es correcto)
- **Si TODOS los videos tienen `store_link: ""` vacío** → Necesitas añadir URLs en el Dashboard al crear videos

## Ubicación del Botón

El botón aparece en la **esquina superior derecha** de cada video, junto a:
- ❤️ Botón de favoritos (rojo)
- ⬇️ Botón de descarga (azul)
- 🛍️ **NUEVO: Botón de tienda (verde)** ← Este es el nuevo

## Cómo Añadir Store Links

Si los videos no tienen `store_link` configurado:

1. Ve al Dashboard (modo admin)
2. Crea un nuevo video
3. Busca el campo **"LINK DE TIENDA ALIEXPRESS/WEB"**
4. Pega la URL de la tienda/proveedor
5. Guarda el video

## Verificar en Base de Datos

Puedes ejecutar este query en Supabase para ver los store_links:

```sql
SELECT
  product_name,
  store_link,
  CASE
    WHEN store_link IS NULL THEN '❌ NULL'
    WHEN store_link = '' THEN '⚠️ VACIO'
    ELSE '✅ TIENE VALOR'
  END as estado
FROM videos
ORDER BY publication_date DESC
LIMIT 10;
```

## Solución de Problemas

### El botón no aparece

1. **Verifica la consola** - ¿Dice `tiene store_link: false`?
   - **Solución**: El video no tiene URL configurada. Añádela en el Dashboard

2. **Verifica la consola** - ¿Dice `tiene store_link: true`?
   - **Solución posible**: Revisa que el icono no esté oculto por CSS
   - Busca un botón con fondo `bg-slate-900/70` y hover `hover:bg-emerald-600`

3. **No aparece nada en la consola**
   - **Solución**: Recarga la página (Cmd+R o Ctrl+R)

### El botón aparece pero no abre la página

1. Revisa la consola - deberías ver `"Abriendo tienda: [URL]"`
2. Verifica que la URL sea válida (empiece con `http://` o `https://`)
3. Verifica que el navegador no esté bloqueando popups

## Campo en la Base de Datos

- **Nombre del campo**: `store_link`
- **Tipo**: `text`
- **Por defecto**: `''` (string vacío)
- **Ubicación**: Tabla `videos`

## Próximos Pasos

1. Abre la biblioteca y revisa la consola
2. Comparte conmigo lo que veas en la consola
3. Si hay videos con `store_link` válido, verifica si ves el botón verde de la bolsa
