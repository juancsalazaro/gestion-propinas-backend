const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

let efectivoEnCaja = 0;
let ultimoId = 0;
let registrosPropinas = [];

app.get("/efectivo-en-caja", (req, res) => {
  res.json({ efectivoEnCaja });
});

app.post("/pagar-efectivo-en-caja", (req, res) => {
  const { montoPropina } = req.body;
  console.log(montoPropina);
  efectivoEnCaja += montoPropina;

  res.json({
    mensaje: "Propina pagada exitosamente",
    nuevoEfectivoEnCaja: efectivoEnCaja,
  });
});

app.get("/registros-propinas", (req, res) => {
  try {
    // Calcular el restante por pagar para cada registro de propinas
    const registrosConRestante = registrosPropinas.map((registro) => {
      const totalPagado = registro.metodosPago.reduce(
        (total, metodo) => total + metodo.monto,
        0
      );
      const restantePorPagar = Math.max(
        0,
        registro.totalPropinas - totalPagado
      );
      return { ...registro, restantePorPagar };
    });

    // Devolver los registros de propinas con el restante calculado
    res.status(200).json({ registrosPropinas: registrosConRestante });
  } catch (error) {
    console.error("Error al consultar los registros de propinas:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.get("/registro-propina/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Buscar el registro de propina por su ID
    const registro = registrosPropinas.find((registro) => registro.id === id);

    // Verificar si se encontró el registro
    if (!registro) {
      return res
        .status(404)
        .json({ mensaje: "Registro de propina no encontrado" });
    }

    // Calcular el total pagado para el registro
    const totalPagado = registro.metodosPago.reduce(
      (total, metodo) => total + metodo.monto,
      0
    );

    // Calcular el restante por pagar
    const restantePorPagar = Math.max(0, registro.totalPropinas - totalPagado);

    // Devolver el registro de propina con el restante por pagar calculado
    res.status(200).json({ registro: { ...registro, restantePorPagar } });
  } catch (error) {
    console.error("Error al consultar el registro de propina:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.post("/pagar-propina", async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const {
      totalPropinas,
      numPersonas,
      propinasPorPersona,
      metodosPago,
      estadoPago,
    } = req.body;

    // Incrementar el contador de IDs y asignar el nuevo ID al registro
    ultimoId++;
    const nuevoPagoPropina = {
      id: ultimoId,
      totalPropinas,
      numPersonas,
      propinasPorPersona,
      metodosPago,
      estadoPago,
    };

    // Almacenar el nuevo registro en la lista de registros de propinas
    registrosPropinas.push(nuevoPagoPropina);

    // Calcular el restante por pagar
    let totalPagado = 0;
    for (const registro of registrosPropinas) {
      totalPagado += registro.metodosPago.reduce(
        (acc, metodo) => acc + metodo.monto,
        0
      );
    }
    const restantePorPagar = totalPropinas - totalPagado;
    efectivoEnCaja += totalPagado;

    // Devolver una respuesta exitosa con el registro creado y el restante por pagar
    res.status(201).json({
      mensaje: "Registro de pago de propina creado exitosamente",
      registro: nuevoPagoPropina,
      restantePorPagar,
    });
  } catch (error) {
    // Manejar cualquier error que pueda ocurrir
    console.error("Error al crear el registro de pago de propina:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.put("/pagar-propina/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Buscar el registro de propina por su ID
    const registro = registrosPropinas.find((registro) => registro.id === id);
    if (!registro) {
      return res
        .status(404)
        .json({ mensaje: "Registro de propina no encontrado" });
    }

    // Validar que el registro no esté completamente pagado
    if (registro.estadoPago === "Pagado") {
      return res
        .status(400)
        .json({ mensaje: "El registro ya está completamente pagado" });
    }

    // Obtener el monto y tipo de pago del cuerpo de la solicitud
    const { monto, tipoPago } = req.body.metodoPago;

    // Validar que el tipo de pago y el monto se hayan proporcionado
    if (!tipoPago || !monto) {
      return res
        .status(400)
        .json({ mensaje: "Datos de método de pago incompletos" });
    }

    // Validar que el monto no sea mayor al restante por pagar
    const totalPagado = registro.metodosPago.reduce(
      (acc, metodo) => acc + metodo.monto,
      0
    );
    const restantePorPagar = registro.totalPropinas - totalPagado;
    if (monto > restantePorPagar) {
      return res
        .status(400)
        .json({ mensaje: "El monto ingresado es mayor al restante por pagar" });
    }

    // Añadir el método de pago al registro de propina
    registro.metodosPago.push({ tipo: tipoPago, monto: monto });
    efectivoEnCaja += monto;

    // Actualizar el restante por pagar y el estado de pago si es necesario
    const nuevoTotalPagado = totalPagado + monto;
    const nuevoRestantePorPagar = registro.totalPropinas - nuevoTotalPagado;
    if (nuevoRestantePorPagar <= 0) {
      registro.estadoPago = "Pagado";
    }

    // Devolver una respuesta exitosa con el registro actualizado y el restante por pagar
    res.json({
      mensaje: "Pago parcial realizado exitosamente",
      registro,
      restantePorPagar: Math.max(nuevoRestantePorPagar, 0), // Aseguramos que el restante por pagar no sea negativo
    });
  } catch (error) {
    // Manejar cualquier error que pueda ocurrir
    console.error("Error al realizar el pago parcial de la propina:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
});
