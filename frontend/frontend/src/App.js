import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORES = {
  primario: "#14b8a6",
  oscuro: "#0d2b4d",
  fondo: "#f1f5f9",
  exito: "#10b981",
  alerta: "#f59e0b",
  pago: "#6366f1",
  email: "#3b82f6",
  sms: "#8b5cf6",
};

const API_URL = "http://localhost:5001/api";
const LOGO_LOCAL = "/CaPaNiWa.png";

// --- COMPONENTE LOGIN ---
function Login({ alEntrar }) {
  const [usuario, setUsuario] = useState("");
  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <div className="contenedor-logo-gigante">
          <img src={LOGO_LOCAL} alt="Logo" className="logo-login-gigante" />
        </div>
        <div className="seccion-datos-login">
          <h1>
            CaPaNiWa <span style={{ fontWeight: 300 }}>CRM</span>
          </h1>
          <p>Ecosistema SaaS para Empresas</p>
          <div className="formulario-login">
            <input
              placeholder="Usuario"
              onChange={(e) => setUsuario(e.target.value)}
            />
            <input type="password" placeholder="Contraseña" />
            <button
              className="boton-primario"
              onClick={() => alEntrar(usuario)}
            >
              INGRESAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE CLIENTES (FORMULARIO EXTENDIDO + COMUNICACIONES) ---
function Clientes({ clientes, refrescar }) {
  const [nuevo, setNuevo] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    cargo: "",
    valorEstimado: "",
  });

  const guardar = async () => {
    if (!nuevo.nombre || !nuevo.empresa)
      return alert("Rellena los campos básicos");
    const timeline = [{ fecha: new Date(), accion: "Lead creado en sistema" }];
    await axios.post(`${API_URL}/clientes`, { ...nuevo, timeline });
    setNuevo({
      nombre: "",
      empresa: "",
      email: "",
      telefono: "",
      cargo: "",
      valorEstimado: "",
    });
    refrescar();
  };

  const enviarComunicacion = async (cliente, tipo) => {
    const mensaje =
      tipo === "Email"
        ? `📧 Email enviado a ${cliente.email}`
        : `📱 SMS enviado a ${cliente.telefono}`;
    const timelineActualizado = [
      ...(cliente.timeline || []),
      { fecha: new Date(), accion: mensaje },
    ];
    await axios.put(`${API_URL}/clientes/${cliente._id}`, {
      timeline: timelineActualizado,
    });
    alert(mensaje);
    refrescar();
  };

  const cambiarEstado = async (cliente, nuevoEstado) => {
    const timelineActualizado = [
      ...(cliente.timeline || []),
      { fecha: new Date(), accion: `Estado: ${nuevoEstado}` },
    ];
    await axios.put(`${API_URL}/clientes/${cliente._id}`, {
      estado: nuevoEstado,
      timeline: timelineActualizado,
    });
    if (nuevoEstado === "Cerrado") {
      await axios.post(`${API_URL}/facturas`, {
        clienteNombre: cliente.nombre,
        empresa: cliente.empresa,
        monto: cliente.valorEstimado,
      });
    }
    refrescar();
  };

  return (
    <div className="animar-entrada">
      <div className="tarjeta-blanca">
        <h3>➕ Alta de Cliente Potencial</h3>
        <div className="grid-formulario">
          <input
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <input
            placeholder="Cargo"
            value={nuevo.cargo}
            onChange={(e) => setNuevo({ ...nuevo, cargo: e.target.value })}
          />
          <input
            placeholder="Empresa"
            value={nuevo.empresa}
            onChange={(e) => setNuevo({ ...nuevo, empresa: e.target.value })}
          />
          <input
            placeholder="Email"
            value={nuevo.email}
            onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
          />
          <input
            placeholder="Teléfono"
            value={nuevo.telefono}
            onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
          />
          <input
            placeholder="Presupuesto €"
            type="number"
            value={nuevo.valorEstimado}
            onChange={(e) =>
              setNuevo({ ...nuevo, valorEstimado: e.target.value })
            }
          />
          <button className="boton-primario full-width" onClick={guardar}>
            CREAR EXPEDIENTE
          </button>
        </div>
      </div>

      {clientes.map((c) => (
        <div key={c._id} className="tarjeta-blanca tarjeta-cliente">
          <div className="cuerpo-cliente">
            <div>
              <h3>
                {c.nombre} <span className="cargo-tag">{c.cargo}</span>
              </h3>
              <p>
                <b>{c.empresa}</b> •{" "}
                <span className={`etiqueta ${c.estado}`}>{c.estado}</span>
              </p>
              <div className="datos-contacto">
                ✉️ {c.email} | 📞 {c.telefono}
              </div>
            </div>
            <div className="acciones-crm">
              <button
                onClick={() => enviarComunicacion(c, "Email")}
                className="btn-com"
                style={{ backgroundColor: COLORES.email }}
              >
                📧
              </button>
              <button
                onClick={() => enviarComunicacion(c, "SMS")}
                className="btn-com"
                style={{ backgroundColor: COLORES.sms }}
              >
                📱
              </button>
              <button
                onClick={() => cambiarEstado(c, "Negociación")}
                className="btn-mini"
              >
                ⏳
              </button>
              <button
                onClick={() => cambiarEstado(c, "Cerrado")}
                className="btn-mini"
              >
                ✅
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENTE FACTURACIÓN ---
function Facturacion() {
  const [facturas, setFacturas] = useState([]);
  const [pagando, setPagando] = useState(null);

  const cargar = async () => {
    const res = await axios.get(`${API_URL}/facturas`);
    setFacturas(res.data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const procesarPago = async (id) => {
    setPagando(id);
    setTimeout(async () => {
      await axios.put(`${API_URL}/facturas/${id}`, { estado: "Pagada" });
      setPagando(null);
      cargar();
    }, 1500);
  };

  return (
    <div className="animar-entrada">
      <div className="tarjeta-blanca">
        <h2>🧾 Gestión de Cobros</h2>
        <table className="tabla-moderna">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f._id}>
                <td>{f.empresa}</td>
                <td>{f.monto}€</td>
                <td>
                  <span className={`etiqueta ${f.estado}`}>{f.estado}</span>
                </td>
                <td>
                  {f.estado === "Pendiente" && (
                    <button
                      className="btn-pago"
                      onClick={() => procesarPago(f._id)}
                    >
                      {pagando === f._id ? "..." : "💳 Pagar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- FUNCIÓN PRINCIPAL (EL EXPORT DEFAULT CORRIGE TU ERROR) ---
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [seccion, setSeccion] = useState("clientes");

  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (e) {
      console.log("Error de conexión");
    }
  };

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  if (!usuario) return <Login alEntrar={setUsuario} />;

  return (
    <div className="contenedor-app">
      <header className="cabecera">
        <div className="marca">
          <img src={LOGO_LOCAL} alt="Logo" height="30" />
          <h1>CaPaNiWa CRM</h1>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <a href="http://localhost:3000" className="btn-enlace">
            📦 ALMACÉN
          </a>
          <button className="btn-salir" onClick={() => setUsuario(null)}>
            SALIR
          </button>
        </div>
      </header>
      <nav className="navegacion">
        <button
          onClick={() => setSeccion("clientes")}
          className={seccion === "clientes" ? "activo" : ""}
        >
          Ventas
        </button>
        <button
          onClick={() => setSeccion("facturas")}
          className={seccion === "facturas" ? "activo" : ""}
        >
          Cobros
        </button>
      </nav>
      <main className="contenido">
        {seccion === "clientes" && (
          <Clientes clientes={clientes} refrescar={cargarDatos} />
        )}
        {seccion === "facturas" && <Facturacion />}
      </main>

      <style>{`
        body { margin: 0; font-family: 'Inter', sans-serif; background: ${COLORES.fondo}; }
        .cabecera { background: ${COLORES.oscuro}; color: white; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; }
        .marca { display: flex; align-items: center; gap: 10px; }
        .marca h1 { font-size: 18px; color: ${COLORES.primario}; }
        .btn-enlace { text-decoration: none; color: ${COLORES.primario}; border: 1px solid ${COLORES.primario}; padding: 5px 10px; border-radius: 6px; font-size: 11px; }
        .navegacion { background: white; padding: 0 40px; display: flex; gap: 20px; border-bottom: 1px solid #e2e8f0; }
        .navegacion button { padding: 15px 0; border: none; background: none; font-weight: bold; cursor: pointer; color: #64748b; }
        .navegacion button.activo { color: ${COLORES.primario}; border-bottom: 3px solid ${COLORES.primario}; }
        .contenido { padding: 20px 40px; max-width: 950px; margin: 0 auto; }
        .tarjeta-blanca { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .grid-formulario { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .full-width { grid-column: span 3; }
        input { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .boton-primario { background: ${COLORES.primario}; color: white; border: none; border-radius: 8px; cursor: pointer; padding: 10px; font-weight: bold; }
        .tarjeta-cliente { border-left: 6px solid ${COLORES.primario}; }
        .cuerpo-cliente { display: flex; justify-content: space-between; align-items: center; }
        .cargo-tag { font-size: 10px; background: #eee; padding: 2px 5px; border-radius: 4px; }
        .btn-com { border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; margin-right: 5px; }
        .btn-mini { padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; margin-left: 5px; }
        .etiqueta { font-size: 10px; padding: 2px 6px; border-radius: 5px; font-weight: bold; }
        .Cerrado, .Pagada { background: #dcfce7; color: #166534; }
        .Pendiente { background: #fef3c7; color: #92400e; }
        .tabla-moderna { width: 100%; border-collapse: collapse; }
        .tabla-moderna td { padding: 12px; border-bottom: 1px solid #eee; }
        .contenedor-login { height: 100vh; background: ${COLORES.oscuro}; display: flex; align-items: center; justify-content: center; }
        .tarjeta-login { background: white; border-radius: 30px; width: 800px; height: 70vh; display: flex; flex-direction: column; overflow: hidden; }
        .contenedor-logo-gigante { flex: 3; display: flex; align-items: center; justify-content: center; }
        .logo-login-gigante { width: 100%; max-width: 400px; object-fit: contain; }
        .seccion-datos-login { flex: 2; background: #f8fafc; padding: 30px; display: flex; flex-direction: column; align-items: center; }
        .formulario-login { width: 250px; display: flex; flex-direction: column; gap: 10px; }
        .animar-entrada { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
