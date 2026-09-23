# Criterios de aceptación — Remesas México → Colombia

Reglas de negocio vigentes. Todo comportamiento de la app que las contradiga es un bug.
Cada regla tiene un identificador (R1, R2…) para citarla en tickets y reportes.

## Cotización bloqueada
- **R1** La cotización fija el tipo de cambio y el monto a recibir por 30 minutos.
- **R2** Si el usuario confirma dentro de ese plazo, el comprobante muestra **exactamente** el mismo tipo de cambio y el mismo monto a recibir que la cotización.

## Comisión
- **R3** Comisión única por envío, visible antes de confirmar: **$49 MXN** a cuentas bancarias (por ejemplo, Bancolombia) y **$29 MXN** a Nequi.
- **R4** Total cobrado = monto enviado + comisión.
- **R5** El saldo del usuario baja **exactamente** el total cobrado, ni un peso más.
- **R6** El saldo de la pantalla de inicio siempre refleja los envíos ya realizados.

## Montos y límites
- **R7** El monto a enviar debe ser de al menos **$100 MXN**. Montos en cero o negativos se rechazan.
- **R8** Máximo **$50,000 MXN por envío** y **$150,000 MXN por mes**. Un envío mayor a $50,000 se rechaza con un mensaje claro.
- **R9** Los envíos a **Nequi** tienen un tope de **$10,000 MXN por envío**; un monto mayor se rechaza antes de cotizar.
- **R10** El monto enviado más la comisión no puede superar el saldo disponible.

## Comprobante
- **R11** Muestra al **remitente** (nombre del usuario que envía).
- **R12** Muestra al destinatario que el usuario eligió, con su banco y cuenta enmascarada.

## Redondeo y formatos
- **R13** Los pesos colombianos se redondean al múltiplo de 500 COP **más cercano**. Ejemplo: $1,002 MXN × 215 = 215,430 COP → se muestran **215,500 COP**.
- **R14** Los montos en MXN se muestran con dos decimales (`$16,049.00`).
- **R15** Los montos en COP usan el formato colombiano: punto de miles y sin decimales (`$ 3.440.000`).
- **R16** Las fechas se muestran en formato **DD/MM/AAAA**, como en toda la app para México.
