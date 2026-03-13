# 🚀 CaPaNiWa CRM - Intelligent Sales Module

Este es el módulo de **Gestión de Relaciones con Clientes (CRM)** del ecosistema CaPaNiWa Tech. Diseñado como una aplicación independiente (microservicio), su objetivo es centralizar la prospección, el seguimiento comercial y la conversión de leads en ventas reales.

## 💎 Propuesta de Valor
A diferencia de un CRM tradicional, este módulo está preparado para integrarse de forma nativa con el **SGA (Almacén)** y el próximo **ERP de Finanzas**, compartiendo una capa de datos coherente a través de MongoDB.

## 🛠️ Funcionalidades Core

### 1. Gestión de Leads 360°
* **Ficha Extendida:** Captura de nombre, empresa, cargo, email, teléfono y valor estimado.
* **Timeline de Auditoría:** Registro automático de cada interacción con el cliente para asegurar la trazabilidad comercial.

### 2. Módulo de Comunicación Activa
* **Acciones Rápidas:** Botones integrados para simular el envío de **Emails** y **SMS**.
* **Auto-Log:** Cada comunicación se registra instantáneamente en el historial del cliente.

### 3. Pipeline de Ventas y Conversión
* **Estados Dinámicos:** Prospecto ➔ Negociación ➔ Cerrado.
* **Integración con Finanzas:** Al marcar una venta como "Cerrada", el CRM dispara automáticamente una orden de facturación que será procesada por el **ERP de Finanzas**.

---

## 🏗️ Arquitectura Técnica

* **Frontend:** React.js con hooks para gestión de estado y Axios para consumo de API.
* **Backend:** Node.js + Express (Puerto `5001`).
* **Base de Datos:** MongoDB (Colecciones: `clientes` y `facturas`).
* **Documentación:** Generación de presupuestos en PDF mediante `jsPDF`.

---

## 🚀 Instalación y Despliegue

### Requisitos
* Node.js v16+
* MongoDB corriendo localmente en el puerto `27017`

### Configuración del Servidor
```bash
cd backend
npm install
node server.js