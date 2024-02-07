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

    res.status(200).json({ registrosPropinas: registrosConRestante });
  } catch (error) {
    console.error("Error al consultar los registros de propinas:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.get("/registro-propina/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const registro = registrosPropinas.find((registro) => registro.id === id);

    if (!registro) {
      return res
        .status(404)
        .json({ mensaje: "Registro de propina no encontrado" });
    }

    const totalPagado = registro.metodosPago.reduce(
      (total, metodo) => total + metodo.monto,
      0
    );

    const restantePorPagar = Math.max(0, registro.totalPropinas - totalPagado);

    res.status(200).json({ registro: { ...registro, restantePorPagar } });
  } catch (error) {
    console.error("Error al consultar el registro de propina:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.post("/pagar-propina", async (req, res) => {
  try {
    const {
      totalPropinas,
      numPersonas,
      propinasPorPersona,
      metodosPago,
      estadoPago,
    } = req.body;

    ultimoId++;
    const nuevoPagoPropina = {
      id: ultimoId,
      totalPropinas,
      numPersonas,
      propinasPorPersona,
      metodosPago,
      estadoPago,
    };

    registrosPropinas.push(nuevoPagoPropina);

    let totalPagado = 0;
    for (const registro of registrosPropinas) {
      totalPagado += registro.metodosPago.reduce(
        (acc, metodo) => acc + metodo.monto,
        0
      );
    }
    const restantePorPagar = totalPropinas - totalPagado;
    efectivoEnCaja += totalPagado;

    res.status(201).json({
      mensaje: "Registro de pago de propina creado exitosamente",
      registro: nuevoPagoPropina,
      restantePorPagar,
    });
  } catch (error) {
    console.error("Error al crear el registro de pago de propina:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.put("/pagar-propina/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const registro = registrosPropinas.find((registro) => registro.id === id);
    if (!registro) {
      return res
        .status(404)
        .json({ mensaje: "Registro de propina no encontrado" });
    }

    if (registro.estadoPago === "Pagado") {
      return res
        .status(400)
        .json({ mensaje: "El registro ya está completamente pagado" });
    }

    const { monto, tipoPago } = req.body.metodoPago;

    if (!tipoPago || !monto) {
      return res
        .status(400)
        .json({ mensaje: "Datos de método de pago incompletos" });
    }

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

    registro.metodosPago.push({ tipo: tipoPago, monto: monto });
    efectivoEnCaja += monto;

    const nuevoTotalPagado = totalPagado + monto;
    const nuevoRestantePorPagar = registro.totalPropinas - nuevoTotalPagado;
    if (nuevoRestantePorPagar <= 0) {
      registro.estadoPago = "Pagado";
    }

    res.json({
      mensaje: "Pago parcial realizado exitosamente",
      registro,
      restantePorPagar: Math.max(nuevoRestantePorPagar, 0),
    });
  } catch (error) {
    console.error("Error al realizar el pago parcial de la propina:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
});

app.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
});
