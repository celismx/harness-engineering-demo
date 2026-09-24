// Monedero (STAGING): lógica de las pantallas.
let token = null;
let cotizacionActual = null;
let destinatarios = [];
let saldo = null;

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

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

function describirDestinatario(d) {
  return `${d.nombre} · ${d.banco} ${d.cuenta}`;
}

async function irAInicio() {
  if (saldo === null) ({ saldo } = await api('GET', '/api/saldo'));
  $('saldo').textContent = mxn.format(saldo);
  mostrar('pantalla-inicio');
}

$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const datos = await api('POST', '/api/login', {
      correo: form.get('correo'),
      password: form.get('password'),
    });
    token = datos.token;
    $('nombre-usuario').textContent = datos.nombre;
    destinatarios = await api('GET', '/api/destinatarios');
    $('destinatario').innerHTML = destinatarios
      .map((d) => `<option value="${d.id}">${describirDestinatario(d)}</option>`)
      .join('');
    await irAInicio();
  } catch (error) {
    $('error-login').textContent = error.message;
  }
});

$('btn-enviar').addEventListener('click', () => {
  $('error-envio').textContent = '';
  mostrar('pantalla-envio');
});

$('form-envio').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const cotizacion = await api('POST', '/api/cotizacion', { monto: form.get('monto') });
    const destinatarioId = form.get('destinatario');
    cotizacionActual = { ...cotizacion, destinatarioId };

    const destinatario = destinatarios.find((d) => String(d.id) === destinatarioId);
    $('cot-destinatario').textContent = describirDestinatario(destinatario);
    $('cot-monto').textContent = mxn.format(cotizacion.montoMxn);
    $('cot-comision').textContent = mxn.format(cotizacion.comision);
    $('cot-total').textContent = mxn.format(cotizacion.total);
    $('cot-tasa').textContent = `1 MXN = ${cotizacion.tasa} COP`;
    $('cot-calculo').textContent = `${mxn.format(cotizacion.montoMxn)} × ${cotizacion.tasa} = ${cop.format(cotizacion.montoMxn * cotizacion.tasa)}`;
    $('cot-recibe').textContent = cop.format(cotizacion.montoCop);
    $('error-confirmar').textContent = '';
    mostrar('pantalla-cotizacion');
  } catch (error) {
    $('error-envio').textContent = error.message;
  }
});

$('btn-confirmar').addEventListener('click', async () => {
  try {
    const c = await api('POST', '/api/confirmar', {
      cotizacionId: cotizacionActual.id,
      destinatarioId: cotizacionActual.destinatarioId,
    });
    $('comp-folio').textContent = c.folio;
    $('comp-fecha').textContent = new Date(c.fecha).toLocaleDateString('en-US', { dateStyle: 'long' });
    $('comp-remitente').textContent = c.remitente;
    $('comp-destinatario').textContent = describirDestinatario(c.destinatario);
    $('comp-monto').textContent = mxn.format(c.montoMxn);
    $('comp-comision').textContent = mxn.format(c.comision);
    $('comp-total').textContent = mxn.format(c.total);
    $('comp-tasa').textContent = `1 MXN = ${c.tasa} COP`;
    $('comp-cotizado').textContent = cop.format(cotizacionActual.montoCop);
    $('comp-recibe').textContent = cop.format(c.montoCop);
    $('comp-saldo-anterior').textContent = mxn.format(c.saldoAnterior);
    $('comp-saldo').textContent = mxn.format(c.saldo);
    $('ultimo-envio').textContent = `${mxn.format(c.total)} a ${c.destinatario.nombre} · folio ${c.folio}`;
    mostrar('pantalla-comprobante');
  } catch (error) {
    $('error-confirmar').textContent = error.message;
  }
});

$('btn-cancelar').addEventListener('click', irAInicio);
$('btn-inicio').addEventListener('click', irAInicio);
