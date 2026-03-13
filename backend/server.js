const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 1. Conexión a MongoDB (Base de datos propia para el CRM)
mongoose
  .connect("mongodb://localhost:27017/capaniwa_crm")
  .then(() => console.log("✅ Conectado a MongoDB (Base: capaniwa_crm)"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// 2. Definición de Modelos (Esquemas de Datos)

// Modelo de Cliente con Ficha Extendida y Timeline
const Cliente = mongoose.model("Cliente", {
  nombre: String,
  empresa: String,
  email: String,
  telefono: String,
  cargo: String,
  valorEstimado: Number,
  estado: { type: String, default: "Prospecto" },
  timeline: Array, // Almacena historial de acciones, emails, sms y cambios de estado
  fechaCreacion: { type: Date, default: Date.now },
});

// Modelo de Factura
const Factura = mongoose.model("Factura", {
  clienteNombre: String,
  empresa: String,
  monto: Number,
  estado: { type: String, default: "Pendiente" }, // Pendiente o Pagada
  fecha: { type: Date, default: Date.now },
});

// 3. Rutas de la API para Clientes

// Obtener todos los clientes
app.get("/api/clientes", async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ fechaCreacion: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// Crear un nuevo cliente (Lead)
app.post("/api/clientes", async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

// Actualizar cliente (Estado, Timeline, Datos)
app.put("/api/clientes/:id", async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!actualizado) return res.status(404).send("Cliente no encontrado");
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

// 4. Rutas de la API para Facturación

// Obtener todas las facturas
app.get("/api/facturas", async (req, res) => {
  try {
    const facturas = await Factura.find().sort({ fecha: -1 });
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener facturas" });
  }
});

// Crear factura (se dispara desde el frontend al cerrar venta)
app.post("/api/facturas", async (req, res) => {
  try {
    const nuevaFactura = new Factura(req.body);
    await nuevaFactura.save();
    res.json(nuevaFactura);
  } catch (error) {
    res.status(500).json({ error: "Error al generar factura" });
  }
});

// Actualizar estado de factura (Pago)
app.put("/api/facturas/:id", async (req, res) => {
  try {
    const facturaPagada = await Factura.findByIdAndUpdate(
      req.params.id,
      { estado: "Pagada" },
      { new: true },
    );
    res.json(facturaPagada);
  } catch (error) {
    res.status(500).json({ error: "Error al procesar pago" });
  }
});

// 5. Arranque del Servidor
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 CRM CaPaNiWa Backend listo`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Base de Datos: MongoDB / capaniwa_crm`);
  console.log(`-----------------------------------------`);
});
