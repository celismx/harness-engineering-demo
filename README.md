# Harness Engineering — QA Agent con Claude Code

Demo de una clase sobre **harness engineering**: cómo diseñar el entorno de un agente de IA para que trabaje bien.

El agente es un **QA Agent** que prueba "Tiendita", una tienda en línea de prueba con 10 bugs sembrados a propósito.
Cada bug rompe una regla de negocio de `docs/criterios-aceptacion.md`. La lista de bugs no está en el repo:
cualquier archivo aquí lo puede leer el agente, y la demo consiste en que los encuentre.

## El harness en 5 piezas

| Pieza | Lo que le dice al agente | Dónde está |
|---|---|---|
| Contexto | "Esta es la app y estas son las reglas del negocio." | `CLAUDE.md`, `docs/criterios-aceptacion.md` |
| Rol | "Eres QA: pruebas como una persona. No arreglas código." | `.claude/agents/qa.md` |
| Herramientas | "Tienes un navegador, y solo ve la app de prueba." | `.mcp.json` (Playwright), `.claude/skills/test-regresion/` |
| Guardrails | "No puedes tocar el código ni salir a internet." | `.claude/settings.json`, `.claude/hooks/solo-localhost.js` |
| Verificación | "No te creo que terminaste hasta que cada regla tenga veredicto y foto." | `.claude/hooks/revisar-cobertura.js` |

## Cómo correrlo

Requisitos: Node 20+, Git y [Claude Code](https://claude.com/claude-code).

```bash
npm install
npx playwright install chromium
npm start        # la tienda en http://localhost:3000 · ana@tiendita.demo / demo1234
```

En otra terminal, dentro del repo:

```bash
claude
> Toma el ticket CHK-101 y verifícalo.
> Revisa la tienda y reporta todos los bugs que encuentres.
```

El QA Agent deja su reporte en `qa/reports/` y los screenshots en `qa/evidence/`.

## Los comandos de la demo

| Comando | Qué hace |
|---|---|
| `npm run harness:off` | Quita los archivos del harness y dice qué pieza se va con cada uno |
| `npm run harness:on` | Los restaura desde git |
| `npm run harness:status` | Muestra qué piezas del harness están presentes |
| `npm run fix` | Aplica la corrección de CHK-101 (rama `fix`) y muestra el cambio |
| `npm run reset` | Deja todo como al inicio: código con bugs, harness prendido, sin reportes ni tests nuevos |
| `npm run test:regression` | Corre los tests de regresión |

`npm start` usa `node --watch`: al aplicar el fix o el reset, la app se reinicia sola.

## Medir con y sin harness

`scripts/medir-bugs.sh` corre el mismo prompt con y sin harness y deja un CSV en `resultados/`:

```bash
N=3 MODELO=haiku ./scripts/medir-bugs.sh
```

Si tienes un `~/.claude/CLAUDE.md` personal, Claude Code también lo carga. El script lo aísla; en clase, renómbralo temporalmente.
