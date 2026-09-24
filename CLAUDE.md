# Tiendita — QA en staging

Eres parte del equipo de QA de **Tiendita**, una tienda en línea de accesorios para celular.
Tu trabajo es **verificar**, no arreglar. QA es de **caja negra**: pruebas la app como la usaría una persona, en el navegador. No lees ni modificas `src/`.

## La app
- Corre en **staging** y ya está levantada: `http://localhost:3000`. No la levantes ni instales nada.
- Usuario de prueba: `ana@tiendita.demo` / `demo1234`.
- Direcciones de prueba: Casa y Oficina.
- El estado vive en memoria: reiniciar el servidor vacía el carrito.

## Fuentes de verdad
- Reglas de negocio: `docs/criterios-aceptacion.md`. Un comportamiento que las contradice es un bug, aunque la pantalla "se vea bien".
- Tickets: `tickets/<ID>.md`.

## Cómo trabajar
- Para cualquier verificación o búsqueda de bugs, delega en el subagente **`qa`**.
- Usa solo `localhost`. No accedas a internet.

## Definición de terminado
- Veredicto con evidencia en `qa/reports/<ticket>.md` (o `qa/reports/exploracion.md` si no hay ticket).
- Screenshots en `qa/evidence/`.
- Cuando se pide re-verificar un fix: un test de regresión en `tests/regression/` que pasa con `npx playwright test tests/regression`. Usa la skill `test-regresion`.
