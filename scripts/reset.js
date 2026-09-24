// npm run reset: deja el repo como al inicio de la demo, explicando cada paso.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const RAIZ = path.join(__dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' });

function vaciar(dir, conservar) {
  const ruta = path.join(RAIZ, dir);
  const borrados = fs.readdirSync(ruta).filter((f) => !conservar.includes(f));
  for (const f of borrados) fs.rmSync(path.join(ruta, f), { recursive: true, force: true });
  return borrados.length;
}

console.log('\n♻️  Reiniciando la demo…\n');
git('checkout', 'HEAD', '--', 'src');
console.log('  ✓ src/ vuelve a la versión con los 10 bugs');
execFileSync(process.execPath, [path.join(__dirname, 'harness.js'), 'on'], { cwd: RAIZ, stdio: 'ignore' });
console.log('  ✓ Harness prendido');
console.log(`  ✓ ${vaciar('qa/reports', ['.gitkeep'])} reportes borrados de qa/reports/`);
console.log(`  ✓ ${vaciar('qa/evidence', ['.gitkeep'])} archivos borrados de qa/evidence/`);
console.log(`  ✓ ${vaciar('tests/regression', ['ejemplo-login.spec.js'])} tests nuevos borrados de tests/regression/`);
console.log('\nListo. Si la app corre con npm start, se reinicia sola y el carrito queda vacío.\n');
