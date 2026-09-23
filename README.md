# Harness Engineering — QA Agent con Claude Code

Demo de una clase sobre **harness engineering**: cómo diseñar el entorno de un agente de IA para que trabaje bien.

El agente es un **QA Agent** que prueba "Monedero", una billetera de prueba con remesas México → Colombia.
La app tiene 11 bugs a propósito. Con el mismo modelo (Claude Haiku), el harness hace la diferencia:

| Versión | Bugs encontrados (de 11, promedio de 3 corridas) | Tiempo |
|---|---|---|
| Sin harness | 2.8 | ~2 min |
| Con harness | 8.8 | ~5 min |
| Con harness + hook de verificación | 9.3 | ~7 min |

Lo que el hook no atrapa: reglas que el agente sí prueba pero marca "cumple" por error. Un hook verifica que el trabajo se hizo, no que se juzgó bien.

## El harness en 5 piezas

| Pieza | Lo que le dice al agente | Dónde está |
|---|---|---|
| Contexto | "Esta es la app y estas son las reglas del negocio." | `CLAUDE.md`, `docs/criterios-aceptacion.md` |
| Rol | "Eres QA: pruebas como una persona. No arreglas código." | `.claude/agents/qa.md` |
| Herramientas | "Tienes un navegador, y solo ve la app de prueba." | `.mcp.json` (Playwright) |
| Guardrails | "No puedes tocar el código ni salir a internet." | `.claude/settings.json`, `.claude/hooks/solo-localhost.js` |
| Verificación | "No te creo que terminaste hasta que cada regla tenga veredicto y foto." | `.claude/hooks/revisar-cobertura.js` |

## Cómo correrlo

Requisitos: Node 20+ y [Claude Code](https://claude.com/claude-code).

```bash
npm install
npx playwright install chromium
npm start                      # app en http://localhost:3000 (usuario: ana@monedero.demo / demo1234)
```

En otra terminal, dentro del repo:

```bash
claude
> Toma el ticket REM-142 y verifícalo.
> Revisa la app y reporta todos los bugs que encuentres.
```

El QA Agent deja su reporte en `qa/reports/` y los screenshots en `qa/evidence/`.

## Comparar con y sin harness

La rama `sin-harness` tiene la misma app sin `CLAUDE.md`, `.claude/`, `.mcp.json` ni `docs/`.
`scripts/medir-bugs.sh` corre el mismo prompt en ambas versiones y deja un CSV en `resultados/`:

```bash
N=3 MODELO=haiku ./scripts/medir-bugs.sh
```

Si tienes un `~/.claude/CLAUDE.md` personal, Claude Code también lo carga. El script lo aísla; en clase, renómbralo temporalmente.
