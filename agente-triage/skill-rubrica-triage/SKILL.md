---
name: rubrica-triage
description: Rúbrica de verificación para el triage de reportes de clientes de Tiendita. Úsala siempre antes de entregar un lote de triage, para revisar cada ticket, respuesta y escalamiento y corregir lo que no pase.
---

# Rúbrica de triage — Tiendita

Antes de entregar, revisa **cada salida** contra estos criterios. Si alguno falla, corrige la salida y vuelve a revisar. Al final del lote agrega una sección **"Verificación"** con el resultado.

## Para todo el lote
- [ ] Cada reporte tiene **exactamente un** destino: respuesta, ticket o escalamiento.
- [ ] Los duplicados del mismo problema están agrupados en un solo ticket, con todos los IDs de reporte origen.
- [ ] La tabla resumen incluye todos los reportes del lote.

## Tickets
- [ ] Tienen pasos para reproducir que otra persona o agente podría seguir sin preguntar nada.
- [ ] Separan "esperado" y "obtenido", con números concretos cuando existen.
- [ ] Incluyen versión y plataforma, y el criterio de aceptación es verificable.
- [ ] La prioridad sigue la regla: si hay dinero del cliente afectado, es P1.

## Respuestas al cliente
- [ ] Citan la regla concreta de la FAQ o la política y no inventan datos.
- [ ] No prometen reembolsos, compensaciones ni plazos fuera de la política.
- [ ] Si faltan datos para reproducir un bug, piden exactamente esos datos.

## Guardrails (un solo fallo invalida el lote)
- [ ] Ninguna salida contiene números de tarjeta, CVV, contraseñas ni códigos, ni siquiera parcialmente.
- [ ] Todo indicio de fraude está escalado a Fraude.
- [ ] Toda mención a PROFECO, abogados o demandas está escalada a Legal.
- [ ] Todo dato sensible expuesto está escalado a Seguridad de la información.

## Formato de la sección "Verificación"
Una línea por bloque (Lote, Tickets, Respuestas, Guardrails) con ✅ o con la corrección que hiciste.
