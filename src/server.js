// Servidor de la demo Tiendita (STAGING). Sin dependencias: npm start
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const PUBLICO = path.join(__dirname, 'public');

const COSTO_ENVIO = 100;
const TASA_IVA = 0.16;

const usuarios = {
  'ana@tiendita.demo': { nombre: 'Ana López', password: 'demo1234' },
};

const productos = [
  { id: 'audifonos', nombre: 'Audífonos inalámbricos', precio: 900, precioLista: 950, emoji: '🎧' },
  { id: 'cargador', nombre: 'Cargador rápido 30 W', precio: 400, precioLista: 400, emoji: '🔌' },
  { id: 'funda', nombre: 'Funda para celular', precio: 250, precioLista: 250, emoji: '📱' },
  { id: 'cable', nombre: 'Cable USB-C 2 m', precio: 150, precioLista: 150, emoji: '🔗' },
];

const direcciones = [
  { id: 1, alias: 'Casa', calle: 'Av. Reforma 123, Col. Juárez, CDMX' },
  { id: 2, alias: 'Oficina', calle: 'Insurgentes Sur 456, Col. Roma, CDMX' },
];

const cupones = {
  BIENVENIDA100: { descuento: 100, vence: '2026-12-31' },
  VERANO20: { descuento: 200, vence: '2026-08-31' },
};

const sesiones = new Map();
const carritos = new Map();

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

function carritoDe(correo) {
  if (!carritos.has(correo)) carritos.set(correo, { items: [], cupon: null });
  return carritos.get(correo);
}

function lineas(carrito) {
  return carrito.items.map(({ id, cantidad }) => {
    const producto = productos.find((p) => p.id === id);
    return { id, nombre: producto.nombre, emoji: producto.emoji, precio: producto.precioLista, cantidad };
  });
}

function calcularResumen(carrito, cupon) {
  const subtotal = lineas(carrito).reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  const descuento = cupon ? cupones[cupon].descuento : 0;
  const envio = carrito.items.length > 0 ? COSTO_ENVIO : 0;
  const iva = Math.round(subtotal * TASA_IVA);
  return { subtotal, cupon, descuento, envio, iva, total: subtotal - descuento + envio + iva };
}

function respuestaCarrito(carrito) {
  return { lineas: lineas(carrito), resumen: calcularResumen(carrito, carrito.cupon) };
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

  'GET /api/productos': async (req, res) => enviarJson(res, 200, productos),

  'GET /api/direcciones': async (req, res) => enviarJson(res, 200, direcciones),

  'GET /api/carrito': async (req, res, correo) => enviarJson(res, 200, respuestaCarrito(carritoDe(correo))),

  'POST /api/carrito': async (req, res, correo) => {
    const { id } = await leerCuerpo(req);
    if (!productos.some((p) => p.id === id)) return enviarJson(res, 404, { error: 'Producto no encontrado' });
    const carrito = carritoDe(correo);
    const item = carrito.items.find((i) => i.id === id);
    if (item) item.cantidad += 1;
    else carrito.items.push({ id, cantidad: 1 });
    enviarJson(res, 200, respuestaCarrito(carrito));
  },

  'PUT /api/carrito': async (req, res, correo) => {
    const { id, cantidad } = await leerCuerpo(req);
    const carrito = carritoDe(correo);
    const item = carrito.items.find((i) => i.id === id);
    if (!item) return enviarJson(res, 404, { error: 'El producto no está en el carrito' });
    const nueva = Number(cantidad);
    if (!Number.isInteger(nueva) || nueva < 1) return enviarJson(res, 400, { error: 'Cantidad inválida' });
    item.cantidad = nueva;
    enviarJson(res, 200, respuestaCarrito(carrito));
  },

  'DELETE /api/carrito': async (req, res, correo) => {
    const { id } = await leerCuerpo(req);
    const carrito = carritoDe(correo);
    carrito.items = carrito.items.filter((i) => i.id !== id);
    enviarJson(res, 200, respuestaCarrito(carrito));
  },

  'POST /api/cupon': async (req, res, correo) => {
    const { codigo } = await leerCuerpo(req);
    const clave = String(codigo || '').trim().toUpperCase();
    if (!cupones[clave]) return enviarJson(res, 400, { error: 'Cupón no válido' });
    const carrito = carritoDe(correo);
    carrito.cupon = clave;
    enviarJson(res, 200, respuestaCarrito(carrito));
  },

  'POST /api/pedidos': async (req, res, correo) => {
    const { direccionId } = await leerCuerpo(req);
    const carrito = carritoDe(correo);
    if (carrito.items.length === 0) return enviarJson(res, 400, { error: 'Tu carrito está vacío' });
    const direccion = direcciones.find((d) => d.id === direccionId) ?? direcciones[0];
    const resumen = calcularResumen(carrito, carrito.cupon);
    const pedido = {
      numero: 'PED-' + Math.floor(100000 + Math.random() * 900000),
      lineas: lineas(carrito),
      direccion,
      totalCobrado: resumen.total,
    };
    carritos.delete(correo);
    enviarJson(res, 200, pedido);
  },
};

const tiposMime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http
  .createServer(async (req, res) => {
    const ruta = rutas[`${req.method} ${req.url}`];
    if (ruta) {
      const publica = req.url === '/api/login';
      const correo = sesiones.get((req.headers.authorization || '').replace('Bearer ', ''));
      if (!publica && !correo) return enviarJson(res, 401, { error: 'Sesión no válida' });
      return ruta(req, res, correo);
    }
    const archivo = path.join(PUBLICO, req.url === '/' ? 'index.html' : path.normalize(req.url));
    if (!archivo.startsWith(PUBLICO) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
      res.writeHead(404);
      return res.end('No encontrado');
    }
    res.writeHead(200, { 'Content-Type': tiposMime[path.extname(archivo)] || 'text/plain' });
    fs.createReadStream(archivo).pipe(res);
  })
  .listen(PORT, () => console.log(`Tiendita (STAGING) en http://localhost:${PORT}`));
