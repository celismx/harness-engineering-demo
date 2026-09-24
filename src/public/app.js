// Tiendita (STAGING): lógica de las pantallas.
let token = null;
let productos = [];
let lineasActuales = [];

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function $(id) {
  return document.getElementById(id);
}

function mostrar(pantalla) {
  document.querySelectorAll('main > section').forEach((s) => (s.hidden = s.id !== pantalla));
}

async function api(metodo, ruta, cuerpo) {
  const respuesta = await fetch(ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error);
  return datos;
}

async function cargarCatalogo() {
  productos = await api('GET', '/api/productos');
  const { lineas } = await api('GET', '/api/carrito');
  $('contador').textContent = lineas.reduce((suma, l) => suma + l.cantidad, 0);
  $('catalogo').innerHTML = productos
    .map(
      (p) => `<article class="producto">
        <span class="emoji">${p.emoji}</span>
        <h3>${p.nombre}</h3>
        <p class="precio">${mxn.format(p.precio)}</p>
        <button data-agregar="${p.id}">Agregar al carrito</button>
      </article>`,
    )
    .join('');
  mostrar('pantalla-catalogo');
}

function pintarLineas() {
  $('lineas').innerHTML = lineasActuales
    .map(
      (l) => `<tr>
        <td>${l.emoji} ${l.nombre}</td>
        <td>${mxn.format(l.precio)}</td>
        <td><input type="number" min="1" value="${l.cantidad}" data-cantidad="${l.id}" aria-label="Cantidad de ${l.nombre}" /></td>
        <td>${mxn.format(l.precio)}</td>
        <td><button class="enlace" data-eliminar="${l.id}">Eliminar</button></td>
      </tr>`,
    )
    .join('');
}

function pintarCarrito({ lineas, resumen }) {
  lineasActuales = lineas;
  pintarLineas();
  $('res-subtotal').textContent = mxn.format(resumen.subtotal);
  $('res-cupon-etiqueta').textContent = resumen.cupon ? `Cupón ${resumen.cupon}` : 'Cupón';
  $('res-cupon').textContent = resumen.descuento ? `−${mxn.format(resumen.descuento)}` : '—';
  $('res-envio').textContent = mxn.format(resumen.envio);
  $('res-iva').textContent = mxn.format(resumen.iva);
  $('res-total').textContent = mxn.format(resumen.total);
}

async function abrirCarrito() {
  const [carrito, direcciones] = await Promise.all([api('GET', '/api/carrito'), api('GET', '/api/direcciones')]);
  $('direccion').innerHTML = direcciones.map((d) => `<option value="${d.id}">${d.alias} · ${d.calle}</option>`).join('');
  pintarCarrito(carrito);
  $('error-cupon').textContent = '';
  $('error-pagar').textContent = '';
  mostrar('pantalla-carrito');
}

$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const datos = await api('POST', '/api/login', { correo: form.get('correo'), password: form.get('password') });
    token = datos.token;
    $('nombre-usuario').textContent = datos.nombre;
    $('btn-carrito').hidden = false;
    await cargarCatalogo();
  } catch (error) {
    $('error-login').textContent = error.message;
  }
});

$('catalogo').addEventListener('click', async (e) => {
  const id = e.target.dataset.agregar;
  if (!id) return;
  await api('POST', '/api/carrito', { id });
  e.target.textContent = 'Agregado ✓';
  setTimeout(() => (e.target.textContent = 'Agregar al carrito'), 1200);
});

$('lineas').addEventListener('change', async (e) => {
  const id = e.target.dataset.cantidad;
  if (!id) return;
  pintarCarrito(await api('PUT', '/api/carrito', { id, cantidad: e.target.value }));
});

$('lineas').addEventListener('click', (e) => {
  const id = e.target.dataset.eliminar;
  if (!id) return;
  lineasActuales = lineasActuales.filter((l) => l.id !== id);
  pintarLineas();
});

$('form-cupon').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    pintarCarrito(await api('POST', '/api/cupon', { codigo: new FormData(e.target).get('codigo') }));
    $('error-cupon').textContent = '';
  } catch (error) {
    $('error-cupon').textContent = error.message;
  }
});

$('btn-pagar').addEventListener('click', async () => {
  try {
    const pedido = await api('POST', '/api/pedidos', { direccionId: $('direccion').value });
    $('conf-numero').textContent = pedido.numero;
    $('conf-direccion').textContent = `${pedido.direccion.alias} · ${pedido.direccion.calle}`;
    $('conf-productos').textContent = pedido.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join(', ');
    $('conf-total').textContent = mxn.format(pedido.totalCobrado);
    mostrar('pantalla-confirmacion');
  } catch (error) {
    $('error-pagar').textContent = error.message;
  }
});

$('btn-carrito').addEventListener('click', abrirCarrito);
$('btn-seguir').addEventListener('click', cargarCatalogo);
$('btn-volver').addEventListener('click', cargarCatalogo);
