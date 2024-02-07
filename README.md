# Gestion Propinas Backend

Este es el backend para una aplicación de gestión de propinas desarrollada por Juan Camilo Salazar. La aplicación permite registrar y gestionar propinas para un establecimiento, así como llevar un registro de los pagos realizados.

## Tecnologías Utilizadas

- **Node.js:** Plataforma de desarrollo de aplicaciones en JavaScript del lado del servidor.
- **Express.js:** Framework de aplicación web de Node.js para crear APIs de manera sencilla y eficiente.
- **MongoDB:** Base de datos NoSQL utilizada para almacenar los registros de propinas.
- **Mongoose:** Biblioteca de modelado de datos de MongoDB para Node.js que proporciona una solución simple y basada en esquemas para gestionar las interacciones con la base de datos.
- **Axios:** Cliente HTTP basado en promesas para el navegador y Node.js.

## Funcionalidades Principales

- **Registro de Propinas:** Permite crear nuevos registros de propinas con detalles como el monto total, el número de personas, los métodos de pago, y el estado de pago.
- **Pagos Parciales:** Permite realizar pagos parciales para los registros de propinas, actualizando el estado de pago y el restante por pagar.
- **Consulta de Registros:** Proporciona endpoints para consultar los registros de propinas, incluyendo el restante por pagar para cada registro.

## Instalación y Uso

1. Clona este repositorio en tu máquina local.
2. Instala las dependencias utilizando npm:
   
4. Inicia el servidor:

5. El servidor estará en funcionamiento en el puerto 3000 por defecto. Puedes acceder a los diferentes endpoints para interactuar con la API.
