// Modo profesor (MODO_PROFESOR=1): marca cada bug sembrado solo cuando ocurre en la pantalla visible.
(() => {
  const texto = (id) => document.getElementById(id).textContent.trim();
  const numero = (s) => Number(s.replace(/[^\d-]/g, ''));

  const reglas = {
    // Bug 1: el comprobante no respeta el tipo de cambio ni el monto cotizados.
    'comp-tasa': () => texto('comp-tasa') !== texto('cot-tasa'),
    'comp-recibe': () => texto('comp-recibe') !== texto('comp-cotizado'),
    // Bug 2: el saldo baja más que el total cobrado.
    'comp-saldo': () =>
      numero(texto('comp-saldo-anterior')) - numero(texto('comp-total')) !== numero(texto('comp-saldo')),
    // Bug 3: el comprobante muestra otro destinatario.
    'comp-destinatario': () => texto('comp-destinatario') !== texto('cot-destinatario'),
    // Bug 6: fecha en formato de EE. UU.
    'comp-fecha': () => /[A-Za-z]/.test(texto('comp-fecha')),
    // Bug 11: falta el remitente.
    'comp-remitente': () => texto('comp-remitente') === '' || texto('comp-remitente') === 'undefined',
    // Bug 7: redondeo hacia abajo en vez de al múltiplo de 500 más cercano.
    'cot-recibe': () => {
      const exacto = numero(texto('cot-calculo').split('=').pop());
      return Math.round(exacto / 500) * 500 !== numero(texto('cot-recibe'));
    },
    // Bug 8: a Nequi cobra $49 en vez de $29.
    'cot-comision': () => texto('cot-destinatario').includes('Nequi') && numero(texto('cot-comision')) !== 2900,
    // Bug 10: el saldo del inicio no refleja el último envío.
    saldo: () => texto('ultimo-envio') !== 'Sin envíos todavía',
    // Bugs 4, 5 y 9: validaciones de monto que no se aplican.
    'monto-ayuda': () => true,
  };

  function marcar() {
    for (const [id, ocurre] of Object.entries(reglas)) {
      const el = document.getElementById(id);
      // Una pantalla que todavía no se llena no tiene bugs que mostrar; el remitente es un campo que queda vacío.
      const sinLlenar = el.textContent.trim() === '' && id !== 'comp-remitente';
      el.classList.toggle('bug-activo', !sinLlenar && ocurre());
    }
  }

  new MutationObserver(marcar).observe(document.querySelector('main'), {
    subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'],
  });
  marcar();
})();
