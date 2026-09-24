# CHK-101 — REPRODUCIDO

**Fecha:** 2026-09-24  
**Ambiente:** staging (localhost:3000)  
**Usuario de prueba:** ana@tiendita.demo / demo1234  

---

## Resultado

| Campo | Esperado | Obtenido | Corrida 1 | Corrida 2 |
|-------|----------|----------|-----------|-----------|
| Total en carrito (con cupón BIENVENIDA100) | $754.00 | $754.00 | ✓ Cumple | ✓ Cumple |
| Total cobrado en confirmación | $754.00 | $854.00 | ✗ No cumple | ✗ No cumple |
| Diferencia | $0.00 | $100.00 (falta descuento) | $100 extra cobrado | $100 extra cobrado |

---

## Evidencia

### Corrida 1
1. **qa/evidence/CHK-101-03-carrito-sin-cupón.png** — Carrito con 2 productos sin cupón, total $854.00
2. **qa/evidence/CHK-101-04-carrito-con-cupón.png** — Carrito con cupón BIENVENIDA100 aplicado, total $754.00 (descuento visible: −$100.00)
3. **qa/evidence/CHK-101-05-confirmacion-corrida1.png** — Confirmación de pago (PED-218136): Total cobrado $854.00 ❌

### Corrida 2
1. **qa/evidence/CHK-101-06-confirmacion-corrida2.png** — Confirmación de pago (PED-344905): Total cobrado $854.00 ❌

---

## Pasos ejecutados (idénticos en ambas corridas)

1. Login con `ana@tiendita.demo` / `demo1234`
2. Agregar "Cargador rápido 30 W" ($400.00)
3. Agregar "Funda para celular" ($250.00)
4. Abrir carrito → Subtotal $650.00, Envío $100.00, IVA $104.00 → Total $854.00
5. Aplicar cupón `BIENVENIDA100` → Descuento −$100.00 → Total $754.00
6. Seleccionar dirección "Casa" (preseleccionada)
7. Hacer clic en "Pagar"
8. Verificar "Total cobrado" en confirmación

---

## Descripción del bug

El cupón `BIENVENIDA100` se aplica correctamente en el carrito, reduciendo el total de $854.00 a $754.00. Sin embargo, en la pantalla de confirmación (después de completar el pago), el campo "Total cobrado" muestra $854.00, ignorando completamente el descuento del cupón.

**Violación de criterio:**
- **R5** (Criterios de aceptación): "El total cobrado en la confirmación es exactamente el total que mostraba el carrito, con el cupón ya descontado."

**Impacto:**
- P1 — Bug de cálculo financiero con impacto directo en dinero del cliente. Se cobra $100.00 adicionales que no se cobraban en el carrito.

---

## Veredicto

**REPRODUCIDO** — El bug ocurre consistentemente. En ambas corridas:
- El carrito muestra correctamente $754.00 con el cupón aplicado
- La confirmación cobra $854.00 sin aplicar el descuento
- Diferencia: $100.00 extra cobrado (equivalente al descuento que debería aplicar el cupón)
