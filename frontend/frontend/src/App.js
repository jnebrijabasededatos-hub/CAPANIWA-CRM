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
  sms: "#8b5cf6"
};

const API_URL = "http://localhost:5001/api";
const LOGO_LOCAL = "/CaPaNiWa.png"; 

// --- COMPONENTE LOGIN ---
function Login({ alEntrar }) {
  const [usuario, setUsuario] = useState("");
  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <div className="contenedor-logo-gigante"><img src={LOGO_LOCAL} alt="Logo" className="logo-login-gigante" /></div>
        <div className="seccion-datos-login">
          <h1>CaPaNiWa <span style={{fontWeight:300}}>CRM</span></h1>
          <p>Gestión de Relaciones y Ventas</p>
          <div className="formulario-login">
            <input placeholder="Usuario" onChange={e => setUsuario(e.target.value)} />
            <input type="password" placeholder="Contraseña" />
            <button className="boton-primario" onClick={() => alEntrar(usuario)}>INGRESAR</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- GESTIÓN DE CLIENTES (FICHA EXTENDIDA) ---
function Clientes({ clientes, refrescar }) {
  const [nuevo, setNuevo] = useState({ 
    nombre: "", empresa: "", email: "", telefono: "", cargo: "", valorEstimado: "" 
  });

  const guardar = async () => {
    if(!nuevo.nombre || !nuevo.empresa) return alert("Nombre y Empresa requeridos");
    const timeline = [{ fecha: new Date(), accion: "Lead registrado en CRM" }];
    await axios.post(`${API_URL}/clientes`, { ...nuevo, timeline });
    setNuevo({ nombre: "", empresa: "", email: "", telefono: "", cargo: "", valorEstimado: "" });
    refrescar();
  };

  const enviarCom = async (c, tipo) => {
    const accion = tipo === 'Email' ? `📧 Email enviado a ${c.email}` : `📱 SMS enviado a ${c.telefono}`;
    const timeline = [...(c.timeline || []), { fecha: new Date(), accion }];
    await axios.put(`${API_URL}/clientes/${c._id}`, { timeline });
    alert(accion);
    refrescar();
  };

  const cambiarEstado = async (c, estado) => {
    const timeline = [...(c.timeline || []), { fecha: new Date(), accion: `Estado: ${estado}` }];
    await axios.put(`${API_URL}/clientes/${c._id}`, { estado, timeline });
    
    // Si se cierra la venta, enviamos la orden a la base de datos de facturas
    if (estado === "Cerrado") {
      await axios.post(`${API_URL}/facturas`, {
        clienteNombre: c.nombre,
        empresa: c.empresa,
        monto: c.valorEstimado
      });
      alert("¡Venta Cerrada! Factura generada automáticamente.");
    }
    refrescar();
  };

  return (
    <div className="animar-entrada">
      <div className="tarjeta-blanca">
        <h3>➕ Alta de Oportunidad Comercial</h3>
        <div className="grid-formulario">
          <input placeholder="Nombre" value={nuevo.nombre} onChange={e=>setNuevo({...nuevo, nombre:e.target.value})} />
          <input placeholder="Cargo" value={nuevo.cargo} onChange={e=>setNuevo({...nuevo, cargo:e.target.value})} />
          <input placeholder="Empresa" value={nuevo.empresa} onChange={e=>setNuevo({...nuevo, empresa:e.target.value})} />
          <input placeholder="Email" value={nuevo.email} onChange={e=>setNuevo({...nuevo, email:e.target.value})} />
          <input placeholder="Teléfono" value={nuevo.telefono} onChange={e=>setNuevo({...nuevo, telefono:e.target.value})} />
          <input placeholder="Valor Estimado (€)" type="number" value={nuevo.valorEstimado} onChange={e=>setNuevo({...nuevo, valorEstimado:e.target.value})} />
          <button className="boton-primario full-width" onClick={guardar}>REGISTRAR LEAD</button>
        </div>
      </div>

      {clientes.map(c => (
        <div key={c._id} className="tarjeta-blanca tarjeta-cliente">
          <div className="cuerpo-cliente">
            <div className="info-base">
              <h3>{c.nombre} <span className="cargo-tag">{c.cargo}</span></h3>
              <p><b>{c.empresa}</b> • <span className={`etiqueta ${c.estado}`}>{c.estado}</span></p>
              <div className="contacto-mini">✉️ {c.email} | 📞 {c.telefono}</div>
              <p className="monto-texto">Valor: {c.valorEstimado}€</p>
            </div>
            <div className="acciones-crm">
              <button onClick={()=>enviarCom(c,'Email')} className="btn-com" style={{backgroundColor: COLORES.email}}>📧 Email</button>
              <button onClick={()=>enviarCom(c,'SMS')} className="btn-com" style={{backgroundColor: COLORES.sms}}>📱 SMS</button>
              <div style={{marginTop: '10px'}}>
                <button onClick={()=>cambiarEstado(c,'Negociación')} className="btn-mini">⏳ Negociar</button>
                <button onClick={()=>cambiarEstado(c,'Cerrado')} className="btn-mini">✅ Cerrar</button>
              </div>
            </div>
          </div>
          <div className="timeline">
            <strong>Historial:</strong>
            {c.timeline?.slice(-2).map((t, i) => (
              <div key={i} className="timeline-item">
                <small>{new Date(t.fecha).toLocaleDateString()}</small> - {t.accion}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- APP COMPLETA ---
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);

  const cargar = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (e) { console.error("Error cargando CRM"); }
  };

  useEffect(() => { if(usuario) cargar(); }, [usuario]);

  if (!usuario) return <Login alEntrar={setUsuario} />;

  return (
    <div className="contenedor-app">
      <header className="cabecera">
        <div className="marca"><h1>CaPaNiWa CRM</h1></div>
        <button className="btn-salir" onClick={() => setUsuario(null)}>SALIR</button>
      </header>
      
      <main className="contenido">
        <div className="header-seccion">
          <h2>Panel de Ventas</h2>
          <p>Gestiona tus clientes y cierra negociaciones</p>
        </div>
        <Clientes clientes={clientes} refrescar={cargar} />
      </main>

      <style>{`
        body { margin: 0; font-family: 'Inter', sans-serif; background: ${COLORES.fondo}; }
        .cabecera { background: ${COLORES.oscuro}; color: white; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
        .marca h1 { font-size: 20px; color: ${COLORES.primario}; margin: 0; }
        .contenido { padding: 30px 40px; max-width: 900px; margin: 0 auto; }
        .header-seccion { margin-bottom: 25px; }
        .header-seccion h2 { margin: 0; color: ${COLORES.oscuro}; }
        .header-seccion p { margin: 5px 0 0 0; color: #64748b; }
        .tarjeta-blanca { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .grid-formulario { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 15px; }
        .full-width { grid-column: span 3; }
        input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
        .boton-primario { background: ${COLORES.primario}; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .boton-primario:hover { opacity: 0.9; transform: translateY(-1px); }
        .tarjeta-cliente { border-left: 6px solid ${COLORES.primario}; position: relative; }
        .cuerpo-cliente { display: flex; justify-content: space-between; align-items: flex-start; }
        .cargo-tag { font-size: 11px; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #64748b; font-weight: normal; }
        .contacto-mini { font-size: 13px; color: #64748b; margin: 8px 0; }
        .monto-texto { font-weight: 800; color: ${COLORES.oscuro}; font-size: 16px; margin: 0; }
        .etiqueta { font-size: 10px; padding: 3px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
        .Cerrado { background: #dcfce7; color: #166534; }
        .Negociación { background: #e0f2fe; color: #075985; }
        .Prospecto { background: #fef3c7; color: #92400e; }
        .btn-com { border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; margin-right: 5px; }
        .btn-mini { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; background: white; font-weight: bold; margin-right: 5px; font-size: 12px; }
        .timeline { margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 8px; border-top: 1px solid #f1f5f9; }
        .timeline-item { font-size: 12px; color: #475569; margin-top: 4px; }
        .contenedor-login { height: 100vh; background: ${COLORES.oscuro}; display: flex; align-items: center; justify-content: center; }
        .tarjeta-login { background: white; border-radius: 30px; width: 700px; height: 400px; display: flex; overflow: hidden; }
        .contenedor-logo-gigante { flex: 1; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; }
        .logo-login-gigante { width: 100%; height: auto; max-height: 250px; object-fit: contain; }
        .seccion-datos-login { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        .formulario-login { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
        .btn-salir { background: none; border: 1px solid #ffffff44; color: white; cursor: pointer; padding: 8px 15px; border-radius: 8px; font-size: 12px; }
        .animar-entrada { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}