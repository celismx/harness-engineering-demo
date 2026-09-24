// Servidor de la demo Monedero (STAGING). Sin dependencias: npm start
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const PUBLICO = path.join(__dirname, 'public');

const COMISION_MXN = 49;
const LIMITE_MENSUAL_MXN = 150000;
const VIGENCIA_COTIZACION_MS = 30 * 60 * 1000;

const usuarios = {
  'ana@monedero.demo': { nombre: 'Ana López', password: 'demo1234', saldo: 120000 },
};

const destinatarios = [
  { id: 1, nombre: 'Rosa Martínez', banco: 'Bancolombia', cuenta: '****4821', ciudad: 'Cali' },
  { id: 2, nombre: 'Carlos Gómez', banco: 'Nequi', cuenta: '300****112', ciudad: 'Medellín' },
];

const sesiones = new Map();
const cotizaciones = new Map();

// Proveedor de tipo de cambio simulado (COP por 1 MXN).
function obtenerTasa(tipo) {
  const tasas = { indicativa: 215, operativa: 210.5 };
  return tasas[tipo];
}

function redondearCop(valor) {
  return Math.floor(valor / 500) * 500;
}

function enviarJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    let datos = '';
    req.on('data', (parte) => (datos += parte));
    req.on('end', () => {
      try {
        resolve(JSON.parse(datos || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function usuarioDeSesion(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const correo = sesiones.get(token);
  return correo ? usuarios[correo] : null;
}

const rutas = {
  'POST /api/login': async (req, res) => {
    const { correo, password } = await leerCuerpo(req);
    const usuario = usuarios[correo];
    if (!usuario || usuario.password !== password) {
      return enviarJson(res, 401, { error: 'Correo o contraseña incorrectos' });
    }
    const token = crypto.randomUUID();
    sesiones.set(token, correo);
    enviarJson(res, 200, { token, nombre: usuario.nombre });
  },

  'GET /api/saldo': async (req, res, usuario) => {
    enviarJson(res, 200, { saldo: usuario.saldo, moneda: 'MXN' });
  },

  'GET /api/destinatarios': async (req, res) => {
    enviarJson(res, 200, destinatarios);
  },

  'POST /api/cotizacion': async (req, res, usuario) => {
    const { monto } = await leerCuerpo(req);
    const montoMxn = Number(monto);
    if (Number.isNaN(montoMxn)) {
      return enviarJson(res, 400, { error: 'Monto inválido' });
    }
    if (montoMxn > LIMITE_MENSUAL_MXN) {
      return enviarJson(res, 400, { error: 'El monto supera el límite permitido' });
    }
    if (montoMxn + COMISION_MXN > usuario.saldo) {
      return enviarJson(res, 400, { error: 'Saldo insuficiente' });
    }
    const tasa = obtenerTasa('indicativa');
    const cotizacion = {
      id: crypto.randomUUID(),
      montoMxn,
      comision: COMISION_MXN,
      total: montoMxn + COMISION_MXN,
      tasa,
      montoCop: redondearCop(montoMxn * tasa),
      vence: Date.now() + VIGENCIA_COTIZACION_MS,
    };
    cotizaciones.set(cotizacion.id, cotizacion);
    enviarJson(res, 200, cotizacion);
  },

  'POST /api/confirmar': async (req, res, usuario) => {
    const { cotizacionId, destinatarioId } = await leerCuerpo(req);
    const cotizacion = cotizaciones.get(cotizacionId);
    if (!cotizacion || cotizacion.vence < Date.now()) {
      return enviarJson(res, 400, { error: 'La cotización venció, vuelve a cotizar' });
    }
    const destinatario = destinatarios.find((d) => d.id === destinatarioId) ?? destinatarios[0];
    const tasa = obtenerTasa('operativa');

    const saldoAnterior = usuario.saldo;
    usuario.saldo -= cotizacion.total + cotizacion.comision;
    cotizaciones.delete(cotizacionId);

    enviarJson(res, 200, {
      folio: 'MON-' + Math.floor(100000 + Math.random() * 900000),
      fecha: new Date().toISOString(),
      remitente: usuario.nombreCompleto,
      destinatario,
      montoMxn: cotizacion.montoMxn,
      comision: cotizacion.comision,
      total: cotizacion.total,
      tasa,
      montoCop: redondearCop(cotizacion.montoMxn * tasa),
      saldoAnterior,
      saldo: usuario.saldo,
    });
  },
};

const tiposMime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http
  .createServer(async (req, res) => {
    const ruta = rutas[`${req.method} ${req.url}`];
    if (ruta) {
      const publica = req.url === '/api/login';
      const usuario = usuarioDeSesion(req);
      if (!publica && !usuario) return enviarJson(res, 401, { error: 'Sesión no válida' });
      return ruta(req, res, usuario);
    }
    const archivo = path.join(PUBLICO, req.url === '/' ? 'index.html' : path.normalize(req.url));
    if (!archivo.startsWith(PUBLICO) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
      res.writeHead(404);
      return res.end('No encontrado');
    }
    res.writeHead(200, { 'Content-Type': tiposMime[path.extname(archivo)] || 'text/plain' });
    fs.createReadStream(archivo).pipe(res);
  })
  .listen(PORT, () => console.log(`Monedero (STAGING) en http://localhost:${PORT}`));
