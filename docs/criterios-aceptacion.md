# Criterios de aceptación — Remesas México → Colombia

Reglas de negocio vigentes. Todo comportamiento de la app que las contradiga es un bug.

## Cotización bloqueada
- La cotización fija el tipo de cambio y el monto a recibir por 30 minutos.
- Si el usuario confirma dentro de ese plazo, el comprobante muestra **exactamente** el mismo tipo de cambio y el mismo monto a recibir que la cotización.

## Comisión
- Comisión única por envío, visible antes de confirmar:
  - **$49 MXN** a cuentas bancarias (por ejemplo, Bancolombia).
  - **$29 MXN** a Nequi.
- Total cobrado = monto enviado + comisión.
- El saldo del usuario baja **exactamente** el total cobrado, ni un peso más.
- El saldo de la pantalla de inicio siempre refleja los envíos ya realizados.

## Montos y límites
- El monto a enviar debe ser de al menos **$100 MXN**. Montos en cero o negativos se rechazan.
- Máximo **$50,000 MXN por envío** y **$150,000 MXN por mes**. Un envío mayor a $50,000 se rechaza con un mensaje claro.
- Los envíos a **Nequi** tienen un tope de **$10,000 MXN por envío**; un monto mayor se rechaza antes de cotizar.
- El monto enviado más la comisión no puede superar el saldo disponible.

## Comprobante
- Muestra al **remitente** (nombre del usuario que envía).
- Muestra al destinatario que el usuario eligió, con su banco y cuenta enmascarada.

## Redondeo y formatos
- Los pesos colombianos se redondean al múltiplo de 500 COP **más cercano**. Ejemplo: $1,002 MXN × 215 = 215,430 COP → se muestran **215,500 COP**.
- Los montos en MXN se muestran con dos decimales (`$16,049.00`).
- Los montos en COP usan el formato colombiano: punto de miles y sin decimales (`$ 3.440.000`).
- Las fechas se muestran en formato **DD/MM/AAAA**, como en toda la app para México.
