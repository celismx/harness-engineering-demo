# Criterios de aceptación — Tiendita

Reglas de negocio vigentes de la tienda. Todo comportamiento de la app que las contradiga es un bug.
Cada regla tiene un identificador (R1, R2…) para citarla en tickets y reportes.

## Carrito
- **R1** El precio de cada producto en el carrito es el mismo que muestra el catálogo.
- **R2** El subtotal de cada línea es precio × cantidad. Ejemplo: 2 × Cable USB-C de $150 → subtotal de la línea $300.
- **R3** "Eliminar" quita el producto del carrito y su importe del total.
- **R4** El contador del botón del carrito muestra cuántas unidades hay en el carrito, y se actualiza al agregar.

## Pago
- **R5** El total cobrado en la confirmación es exactamente el total que mostraba el carrito, con el cupón ya descontado.
- **R6** El pedido se envía a la dirección que el cliente eligió.

## Precios, envío y cupones
- **R7** El envío cuesta $100 y es gratis cuando el subtotal es de $1,000 o más. Ejemplo: $1,150 de subtotal (Audífonos + Funda) → envío $0.
- **R8** Los precios del catálogo ya incluyen IVA: no se suma IVA aparte.
- **R9** Máximo 5 unidades por producto en un mismo pedido.
- **R10** Cupones vigentes: `BIENVENIDA100` ($100 de descuento, vence el 31/12/2026). `VERANO20` venció el 31/08/2026 y debe rechazarse.
