# Ejemplo de ticket bien hecho (formato a seguir)

**ID:** ENV-087
**Resumen:** El número de guía no aparece en Mis pedidos cuando el pedido se envía a una dirección nueva
**Severidad:** P2
**Categoría:** bug
**Reportes origen:** R-2231, R-2240

**Reporte (parafraseado):** Dos clientes dicen que su pedido aparece como "Enviado" pero sin número de guía. En ambos casos agregaron la dirección el mismo día de la compra.

**Pasos para reproducir:**
1. Iniciar sesión con un usuario de prueba.
2. Agregar una dirección nueva y comprar un producto con envío a esa dirección.
3. Marcar el pedido como enviado desde el panel de almacén.
4. Revisar el pedido en Mis pedidos.

**Esperado:** el pedido muestra el número de guía al cambiar a "Enviado".
**Obtenido:** el pedido dice "Enviado" y el número de guía aparece vacío.

**Versión / dispositivo:** Android 4.11.3 (Samsung A54) e iOS 4.11.2 (iPhone 13).
**Criterio de aceptación:** todo pedido "Enviado" muestra su número de guía, sin importar si la dirección es nueva.
