// npm run fix: trae a src/ la corrección de CHK-101 desde la rama fix y muestra el cambio.
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const RAIZ = path.join(__dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' });
const tty = process.stdout.isTTY;

// En un clon recién descargado la rama solo existe como origin/fix.
let rama = 'fix';
try {
  git('rev-parse', '--verify', '--quiet', 'fix');
} catch {
  rama = 'origin/fix';
}

console.log('\n🔧 Aplicando el fix de CHK-101 (rama fix)…\n');
console.log(git('diff', ...(tty ? ['--color'] : []), 'HEAD', rama, '--', 'src'));
git('checkout', rama, '--', 'src');
console.log('✓ Fix aplicado en src/. Si la app corre con npm start, se reinicia sola.');
console.log('→ Para volver a la versión con bugs: npm run reset\n');
