// PreToolUse: bloquea que el navegador de Playwright salga de localhost.
let entrada = '';
process.stdin.on('data', (parte) => (entrada += parte));
process.stdin.on('end', () => {
  const { tool_input } = JSON.parse(entrada);
  const { hostname } = new URL(tool_input.url, 'http://localhost');
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    process.stderr.write(`Bloqueado: solo se permite navegar a localhost (se pidió ${tool_input.url}).`);
    process.exit(2);
  }
});
