# Criterios de aceptación — Remesas México → Colombia

Reglas de negocio vigentes. Todo comportamiento de la app que las contradiga es un bug.

## Cotización bloqueada
- La cotización fija el tipo de cambio y el monto a recibir por 30 minutos.
- Si el usuario confirma dentro de ese plazo, el comprobante muestra **exactamente** el mismo tipo de cambio y el mismo monto a recibir que la cotización.

## Comisión
- Comisión única de **$49 MXN** por envío, visible antes de confirmar.
- Total cobrado = monto enviado + $49.
- El saldo del usuario baja **exactamente** el total cobrado, ni un peso más.

## Montos y límites
- El monto a enviar debe ser de al menos **$100 MXN**. Montos en cero o negativos se rechazan.
- Máximo **$50,000 MXN por envío** y **$150,000 MXN por mes**. Un envío mayor a $50,000 se rechaza con un mensaje claro.
- El monto enviado más la comisión no puede superar el saldo disponible.

## Destinatario
- El comprobante muestra al destinatario que el usuario eligió, con su banco y cuenta enmascarada.

## Redondeo y formatos
- Los pesos colombianos se redondean al múltiplo de 500 COP más cercano.
- Los montos en MXN se muestran con dos decimales.
- Las fechas se muestran en formato **DD/MM/AAAA**, como en toda la app para México.
