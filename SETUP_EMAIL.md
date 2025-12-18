# Configuración de Emails - Sistema de Activación

## Resumen del Sistema

Tu aplicación ahora tiene un sistema completo de códigos de activación que funciona así:

1. **Landing Page**: Los usuarios ven los planes disponibles en la home
2. **Compra en Stripe**: Hacen clic y pagan en Stripe
3. **Generación de Código**: Tú generas un código de 6 dígitos para el cliente
4. **Emails Automáticos**: Se envían emails al cliente y a ti (holayuxty@gmail.com)
5. **Activación**: El cliente ingresa el código y obtiene acceso

## Configurar Resend para Envío de Emails

Para que los emails funcionen automáticamente, necesitas configurar Resend (servicio de emails):

### Paso 1: Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita (incluye 3,000 emails gratis al mes)
3. Verifica tu email

### Paso 2: Obtener tu API Key

1. En el dashboard de Resend, ve a "API Keys"
2. Haz clic en "Create API Key"
3. Dale un nombre (ejemplo: "dropghost Production")
4. Copia la API key que te dan

### Paso 3: Configurar la API Key en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a "Project Settings" → "Edge Functions" → "Environment Variables"
3. Agrega una nueva variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Pega tu API key de Resend aquí
4. Guarda los cambios

### Paso 4: Verificar tu dominio (Opcional pero recomendado)

Por defecto, los emails se enviarán desde `noreply@dropghost.com` (que no funcionará sin verificar el dominio).

**Opción A - Usar dominio de Resend (Más fácil):**
Los emails se enviarán desde un dominio genérico de Resend.

**Opción B - Usar tu propio dominio (Recomendado):**
1. En Resend, ve a "Domains"
2. Agrega tu dominio
3. Configura los registros DNS que te indican
4. Una vez verificado, actualiza el código en la Edge Function para usar tu dominio

## Cómo Funciona el Flujo Completo

### Cuando un cliente compra:

1. El cliente hace la compra en Stripe
2. Tú recibes la notificación de Stripe (o el cliente te contacta)
3. Vas al panel de Admin en tu dashboard
4. Haces clic en "Generar Código"
5. Ingresas:
   - Email del cliente
   - Plan que compró
6. El sistema:
   - Genera un código único de 6 dígitos
   - Guarda el código en la base de datos
   - Envía email al cliente con su código
   - Envía email a ti (holayuxty@gmail.com) con los detalles de la venta

### Cuando el cliente activa su código:

1. El cliente crea una cuenta o inicia sesión
2. Ingresa su código de 6 dígitos
3. El sistema:
   - Verifica que el código sea válido y no esté usado
   - Activa la suscripción del cliente
   - Marca el código como usado
   - Le da acceso inmediato al contenido

## Planes Disponibles

### 1. Acceso Diario - 1,99€
- Dura 24 horas desde la activación
- Se marca automáticamente como expirado después de 24 horas

### 2. Oferta Especial - 19,99€ (Solo 50 usuarios)
- Acceso de por vida
- El sistema cuenta automáticamente cuántos se han vendido
- Después de 50 ventas, esta opción se deshabilita automáticamente

### 3. Acceso Mensual - 29,99€
- Dura 30 días desde la activación
- Debe renovarse cada mes

## Alternativa sin Email Automático

Si no quieres configurar Resend ahora, puedes:

1. Generar códigos desde el panel de admin
2. El código se mostrará en pantalla
3. Copiar el código manualmente
4. Enviarlo al cliente por WhatsApp, Email manual, etc.

El sistema seguirá funcionando perfectamente, solo que tendrás que enviar los códigos manualmente.

## Webhooks de Stripe (Opcional - Avanzado)

Para automatizar completamente el proceso, puedes configurar un webhook de Stripe que:
1. Reciba notificaciones cuando alguien paga
2. Genere automáticamente el código
3. Envíe los emails sin tu intervención

Esto requeriría crear una Edge Function adicional que escuche los eventos de Stripe.

## Soporte

Si tienes problemas:
1. Verifica que la API key de Resend esté configurada correctamente
2. Revisa los logs de la Edge Function en Supabase
3. Prueba enviando un código de prueba primero

## Seguridad

- Los códigos son únicos y de un solo uso
- No se pueden reutilizar
- Cada código está vinculado a un plan específico
- Los administradores no pueden activar códigos, solo generarlos
