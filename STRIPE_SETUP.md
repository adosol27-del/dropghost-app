# Configuracion de Stripe Payment Links

## El Problema

El error **"No hay URL de proveedor configurada para este producto"** ocurre porque los Payment Links de Stripe no tienen configurada la URL de retorno (redirect URL) que se usa despues de completar el pago.

Este error SOLO se soluciona configurando manualmente cada Payment Link en el Dashboard de Stripe. No se puede resolver desde el codigo.

## Solucion: Configurar URLs de Retorno

### Paso 1: Accede a tu Dashboard de Stripe

Abre: https://dashboard.stripe.com/payment-links

### Paso 2: Configura CADA Payment Link (tienes 3)

Para cada uno de tus Payment Links:

1. **Haz clic en el Payment Link** para abrirlo
2. **Haz clic en "Edit"** (boton en la esquina superior derecha)
3. **Busca la seccion "After payment"** (o "Despues del pago")
4. **Selecciona "Redirect to a URL"** (o "Redirigir a una URL")
5. **Pega tu URL de retorno:**

```
Tu URL aqui /#/auth
```

Por ejemplo, si tu dominio es `https://miapp.com`, la URL seria:
```
https://miapp.com/#/auth
```

6. **Haz clic en "Save"** para guardar los cambios
7. **Repite para los otros 2 Payment Links**

### Paso 3: Verifica

Despues de guardar, deberias ver tu URL configurada en la seccion "After payment" de cada Payment Link.

## Tus Payment Links Actuales

1. **Acceso Diario (1,99€):** `https://buy.stripe.com/28E4gz4bM7c8ekt0hufjG0T`
2. **Oferta Especial (19,99€):** `https://buy.stripe.com/bJebJ18s26845NX4xKfjG0S`
3. **Acceso Mensual (29,99€):** `https://buy.stripe.com/bJebJ18s26845NX4xKfjG0S`

## Notas Importantes

- **Modo Test vs Live:** Asegurate de estar en el modo correcto (test o live) segun donde esten tus Payment Links
- **Guarda los cambios:** No olvides hacer clic en "Save" despues de pegar la URL
- **Verifica todos:** Tienes que configurar los 3 Payment Links, no solo uno

## Solucion Temporal

Mientras configuras Stripe, los usuarios pueden:
1. Completar el pago en Stripe
2. Recibir un codigo de 6 digitos por email
3. Usar el boton "Ya pague, activar suscripcion" en tu app
4. Ingresar el codigo para activar su suscripcion

## Soporte

Si sigues teniendo problemas:
- Verifica que hayas guardado los cambios en Stripe
- Asegurate de estar usando la URL exacta de tu aplicacion
- Comprueba que los Payment Links esten en el modo correcto (test/live)
