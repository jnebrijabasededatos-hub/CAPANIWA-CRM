# 🚀 CaPaNiWa Tech - Business Ecosystem (SGA & CRM)

Bienvenido al ecosistema de **CaPaNiWa Tech**, una suite integral de gestión empresarial diseñada como una solución SaaS modular. Este repositorio contiene una arquitectura robusta que conecta la gestión de almacenes (SGA) con la inteligencia comercial (CRM) y un módulo de facturación automatizada.

## 📦 Componentes del Ecosistema

### 1. CRM & Sales Intelligence (Puerto 5001)
Diseñado para transformar leads en ingresos mediante:
* **Ficha de Cliente Pro:** Registro extendido (Cargo, Email, Teléfono, Empresa).
* **Comunicación Omnicanal:** Simulación de envío de SMS y Emails con registro automático.
* **Timeline de Auditoría:** Historial completo de interacciones por cliente (tipo Dynamics 365).
* **Generación de PDF:** Creación automática de presupuestos profesionales con `jsPDF`.
* **Conversión Automática:** Al cerrar una venta, el sistema genera automáticamente una factura en el módulo contable.

### 2. SGA - Sistema de Gestión de Almacén (Puerto 5000)
Control total sobre el inventario físico:
* **Control de Stock:** Altas, bajas y alertas de stock mínimo.
* **Etiquetado QR:** Generación de códigos QR para cada producto.
* **Dashboard de Inventario:** Visualización en tiempo real del estado de los activos.

### 3. Módulo Financiero & Pasarela de Pagos
* **Gestión de Facturación:** Listado de cobros pendientes y pagados.
* **Pasarela CaPaNiWa Pay:** Simulación de procesamiento de pagos asíncronos con validación visual.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* React.js
* Axios (Gestión de peticiones API)
* jsPDF & AutoTable (Generación de documentos)
* CSS Moderno (Diseño responsivo y animaciones)

**Backend:**
* Node.js & Express
* MongoDB (Base de datos NoSQL)
* Mongoose (Modelado de datos)
* CORS (Seguridad entre servicios)

---

## 🚀 Instalación y Uso

### Requisitos previos
* Node.js instalado.
* Instancia de MongoDB corriendo localmente (`mongodb://localhost:27017`).

### Paso 1: Configurar el CRM
```bash
cd CaPaNiWa-CRM/backend
npm install
node server.js

cd ../frontend
npm install
npm start