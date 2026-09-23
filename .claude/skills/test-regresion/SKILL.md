---
name: test-regresion
description: Escribe y corre un test de regresión con Playwright para un ticket ya verificado. Úsala cuando se pide dejar un test de regresión después de un fix.
---

# Test de regresión

1. Lee `tests/regression/ejemplo-login.spec.js` y sigue su formato: CommonJS, `@playwright/test`, selectores por etiqueta o rol, `baseURL` ya configurada.
2. Crea `tests/regression/<ticket-en-minúsculas>.spec.js` (por ejemplo `rem-142.spec.js`).
3. El test recorre los pasos del ticket y verifica el **criterio de aceptación** con los números concretos del ticket. Un test por criterio; nombres en español que digan qué regla protegen.
4. Corre `npx playwright test tests/regression`. Todos deben pasar. Si falla, revisa si el problema es el test o la app: nunca ajustes el test para que acepte el comportamiento incorrecto.
5. Agrega al reporte del ticket la ruta del test y la salida del comando.
