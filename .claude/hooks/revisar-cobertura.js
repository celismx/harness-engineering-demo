// Stop del subagente qa: no lo deja terminar una exploración hasta que la matriz de cobertura
// del reporte tenga una fila por cada regla de docs/criterios-aceptacion.md, use el ejemplo
// de las reglas que lo traen y respalde con screenshot cada fila marcada como "cumple".
// Tras MAX_BLOQUEOS rechazos deja terminar, para no ciclar indefinidamente.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const MAX_BLOQUEOS = 3;

let entrada = '';
process.stdin.on('data', (parte) => (entrada += parte));
process.stdin.on('end', () => {
  const evento = JSON.parse(entrada);
  const raiz = process.env.CLAUDE_PROJECT_DIR || evento.cwd;
  const reporte = path.join(raiz, 'qa/reports/exploracion.md');
  if (!fs.existsSync(reporte)) return;

  const contador = path.join(os.tmpdir(), `qa-cobertura-${evento.agent_id ?? evento.session_id}`);
  const bloqueos = fs.existsSync(contador) ? Number(fs.readFileSync(contador, 'utf8')) : 0;
  if (bloqueos >= MAX_BLOQUEOS) return;

  const criterios = fs.readFileSync(path.join(raiz, 'docs/criterios-aceptacion.md'), 'utf8');
  const reglas = [...criterios.matchAll(/^- \*\*(R\d+)\*\*(.*)$/gm)].map(([, id, texto]) => ({
    id,
    ejemplo: texto.match(/Ejemplo:\s*\$?([\d,.]+)/)?.[1].replace(/[,.]/g, ''),
  }));

  const filas = new Map();
  for (const linea of fs.readFileSync(reporte, 'utf8').split('\n')) {
    const id = linea.match(/^\|\s*\**(R\d+)\b/)?.[1];
    if (id) filas.set(id, (filas.get(id) ?? '') + linea);
  }

  const pendientes = [];
  for (const { id, ejemplo } of reglas) {
    const fila = filas.get(id);
    if (!fila) {
      pendientes.push(`${id}: falta su fila en la matriz de cobertura.`);
      continue;
    }
    if (ejemplo && !fila.replace(/[,.\s]/g, '').includes(ejemplo)) {
      pendientes.push(`${id}: la regla trae un ejemplo; el caso debe usar ese ejemplo tal cual.`);
    }
    if (/\bcumple\b/i.test(fila) && !/no cumple/i.test(fila) && !/\.png/.test(fila)) {
      pendientes.push(`${id}: está marcada "cumple" sin screenshot que lo respalde.`);
    }
  }
  if (pendientes.length === 0) return;

  fs.writeFileSync(contador, String(bloqueos + 1));
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason:
        'La matriz de cobertura de qa/reports/exploracion.md está incompleta. ' +
        'Ejecuta en el navegador los casos que faltan, actualiza el reporte y vuelve a terminar:\n- ' +
        pendientes.join('\n- '),
    }),
  );
});
