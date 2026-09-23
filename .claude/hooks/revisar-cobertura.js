// Definición de terminado del subagente qa, ejecutada como código (hook Stop).
// Cuando el agente intenta terminar una exploración, revisa su reporte contra las reglas de
// docs/criterios-aceptacion.md. Si algo falta, lo regresa a trabajar con la lista de pendientes:
//   1. Cada regla tiene su fila en la matriz de cobertura.
//   2. Cada fila tiene un veredicto claro: "cumple" o "no cumple".
//   3. Cada fila tiene un screenshot como evidencia.
//   4. Si la regla trae un ejemplo, el caso de prueba usa ese ejemplo.
// Regresa al agente como máximo MAX_REGRESOS veces, para no ciclar indefinidamente.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const MAX_REGRESOS = 3;

let entrada = '';
process.stdin.on('data', (parte) => (entrada += parte));
process.stdin.on('end', () => {
  const evento = JSON.parse(entrada);
  const raiz = process.env.CLAUDE_PROJECT_DIR || evento.cwd;
  const reporte = path.join(raiz, 'qa/reports/exploracion.md');
  if (!fs.existsSync(reporte)) return;

  const contador = path.join(os.tmpdir(), `qa-cobertura-${evento.agent_id ?? evento.session_id}`);
  const regresos = fs.existsSync(contador) ? Number(fs.readFileSync(contador, 'utf8')) : 0;
  if (regresos >= MAX_REGRESOS) return;

  // Reglas: "- **R13** texto… Ejemplo: $1,002 MXN …"
  const criterios = fs.readFileSync(path.join(raiz, 'docs/criterios-aceptacion.md'), 'utf8');
  const reglas = [...criterios.matchAll(/^- \*\*(R\d+)\*\*(.*)$/gm)].map(([, id, texto]) => ({
    id,
    ejemplo: texto.match(/Ejemplo:\s*\$?([\d,]+)/)?.[1].replaceAll(',', ''),
  }));

  // Filas de la matriz: "| R13 | caso | no cumple: … | qa/evidence/r13.png |"
  const filas = new Map();
  for (const linea of fs.readFileSync(reporte, 'utf8').split('\n')) {
    const id = linea.match(/^\|\s*\**(R\d+)\b/)?.[1];
    if (id) filas.set(id, linea);
  }

  const pendientes = [];
  for (const { id, ejemplo } of reglas) {
    const fila = filas.get(id);
    if (!fila) {
      pendientes.push(`${id}: no tiene fila en la matriz.`);
      continue;
    }
    if (!/\bcumple\b/i.test(fila)) pendientes.push(`${id}: falta el veredicto ("cumple" o "no cumple").`);
    if (!fila.includes('.png')) pendientes.push(`${id}: falta el screenshot.`);
    if (ejemplo && !fila.replaceAll(',', '').includes(ejemplo)) {
      pendientes.push(`${id}: la regla trae un ejemplo; pruébalo tal cual.`);
    }
  }
  if (pendientes.length === 0) return;

  fs.writeFileSync(contador, String(regresos + 1));
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: `Todavía no terminas. Pendientes en qa/reports/exploracion.md:\n- ${pendientes.join('\n- ')}`,
    }),
  );
});
