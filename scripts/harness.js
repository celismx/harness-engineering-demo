// npm run harness:off | harness:on | harness:status
// Apaga el harness borrando sus archivos del directorio de trabajo y lo prende restaurándolos desde git.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const RAIZ = path.join(__dirname, '..');
const PIEZAS = [
  { pieza: 'Contexto', archivos: ['CLAUDE.md', 'docs/criterios-aceptacion.md'], que: 'qué es la app y las reglas del negocio' },
  { pieza: 'Rol', archivos: ['.claude/agents/qa.md'], que: 'el agente de QA y cómo trabaja' },
  { pieza: 'Herramientas', archivos: ['.mcp.json', '.claude/skills/test-regresion/SKILL.md'], que: 'el navegador (Playwright) y la skill del test' },
  { pieza: 'Guardrails', archivos: ['.claude/settings.json', '.claude/hooks/solo-localhost.js'], que: 'permisos: no tocar src/, sin internet' },
  { pieza: 'Verificación', archivos: ['.claude/hooks/revisar-cobertura.js'], que: 'el hook que revisa el reporte antes de terminar' },
];
const TODOS = PIEZAS.flatMap((p) => p.archivos);

const color = (codigo) => (texto) => (process.stdout.isTTY ? `\x1b[${codigo}m${texto}\x1b[0m` : texto);
const verde = color('32');
const rojo = color('31');
const gris = color('90');
const negritas = color('1');

const existe = (archivo) => fs.existsSync(path.join(RAIZ, archivo));
const git = (...args) => execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' });

function linea(simbolo, { pieza, archivos, que }) {
  return `  ${simbolo} ${negritas(pieza.padEnd(13))} ${archivos.join(', ')}\n      ${gris(que)}`;
}

function apagar() {
  const modificados = git('status', '--porcelain', '--', ...TODOS).trim();
  if (modificados) {
    console.error(rojo('No apago el harness: estos archivos tienen cambios sin guardar en git.'));
    console.error(modificados);
    console.error('Haz commit de tus cambios o descártalos, y vuelve a intentar.');
    process.exit(1);
  }
  console.log(negritas('\n🔌 Apagando el harness…\n'));
  for (const p of PIEZAS) {
    for (const archivo of p.archivos) fs.rmSync(path.join(RAIZ, archivo), { force: true });
    console.log(linea(rojo('✗'), p));
  }
  for (const dir of ['.claude/agents', '.claude/hooks', '.claude/skills/test-regresion', '.claude/skills', '.claude', 'docs']) {
    const ruta = path.join(RAIZ, dir);
    if (fs.existsSync(ruta) && fs.readdirSync(ruta).length === 0) fs.rmdirSync(ruta);
  }
  console.log(negritas(rojo('\nHarness APAGADO.')) + ' El agente ya no conoce las reglas del negocio, no tiene rol,');
  console.log('ni navegador, ni límites, ni nadie que revise su trabajo.');
  console.log(gris('→ Si Claude Code está abierto, sal con /exit y ábrelo de nuevo para que tome el cambio.\n'));
}

function prender() {
  console.log(negritas('\n🔌 Prendiendo el harness…\n'));
  git('checkout', 'HEAD', '--', ...TODOS);
  for (const p of PIEZAS) console.log(linea(verde('✓'), p));
  console.log(negritas(verde('\nHarness PRENDIDO.')) + ' El agente tiene contexto, rol, herramientas, guardrails y verificación.');
  console.log(gris('→ Si Claude Code está abierto, sal con /exit y ábrelo de nuevo para que tome el cambio.\n'));
}

function estado() {
  console.log(negritas('\nEstado del harness\n'));
  for (const p of PIEZAS) console.log(linea(p.archivos.every(existe) ? verde('✓') : rojo('✗'), p));
  const prendido = TODOS.every(existe);
  console.log(`\n${prendido ? verde('PRENDIDO') : rojo('APAGADO (o incompleto)')}\n`);
}

const accion = { off: apagar, on: prender, status: estado }[process.argv[2]];
if (!accion) {
  console.error('Uso: node scripts/harness.js on | off | status');
  process.exit(1);
}
accion();
