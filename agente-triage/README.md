# Ejemplo 1 · Agente de triage sin código

El primer agente de la clase. Recibe un lote de reportes de clientes de Tiendita y le da a cada uno un destino: responder, crear un ticket o escalar a una persona. Uno de sus tickets, **CHK-101**, es la entrada del QA Agent del repo.

Se monta en un **Proyecto de Claude** (claude.ai), sin escribir código.

| Archivo | Dónde se monta | Pieza del Harness Canvas |
|---|---|---|
| `instrucciones-proyecto.md` | Instrucciones del Proyecto (copiar y pegar) | Objetivo y "terminado", Guardrails, Loop |
| `conocimiento/*.md` (4 archivos) | Conocimiento del Proyecto (subir) | Contexto |
| `skill-rubrica-triage/` | Configuración → Skills (comprimir la carpeta en .zip y subirla) | Verificación |
| `reportes/reportes-clientes.md` | Se pega en el chat | Entrada del agente |

## Cómo montarlo
1. Crea un Proyecto llamado "Triage Tiendita".
2. Pega `instrucciones-proyecto.md` en las instrucciones del Proyecto.
3. Sube los 4 archivos de `conocimiento/`.
4. Comprime `skill-rubrica-triage/` en un .zip, súbelo en Skills y verifica que esté activo.

## Prompt
> Aquí están los reportes de clientes de hoy. Haz el triage completo.
> [pegar el contenido de reportes/reportes-clientes.md]
