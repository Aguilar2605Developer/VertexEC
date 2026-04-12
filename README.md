# Sistema de Cotización de Planos y Construcción - VertexEC

Esta aplicación web permite crear cotizaciones automáticas para proyectos de construcción, centralizando la información técnica y eliminando errores manuales.

## 🚀 Características

- ✅ **Interfaz responsiva** con formularios dinámicos para materiales, mano de obra y especificaciones
- ✅ **Cálculos automáticos** de presupuestos en tiempo real
- ✅ **Backend con MongoDB** y fallback en memoria si MongoDB no está disponible
- ✅ **Materiales pre-cargados** con costos actualizables
- ✅ **Gestión de proyectos** con panel de control
- ✅ **API REST** completa para integraciones futuras
- ✅ **Configuración automática** mediante `.env.example`

## 📋 Requisitos

- Node.js (versión 18 o superior)
- npm
- Opcional: MongoDB local o remoto

## 🛠️ Instalación y Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el archivo de variables de entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```
En Windows PowerShell usa:
```powershell
Copy-Item .env.example .env
```

### 3. Ajustar la configuración si es necesario
Edita `.env` para cambiar `PORT`, `MONGO_URI` o `JWT_SECRET`.

### 4. Iniciar la aplicación
```bash
npm start
```

### 5. Acceder a la aplicación
Abre tu navegador y ve a: **http://localhost:3000**

> Si MongoDB no está disponible, el servidor usa almacenamiento en memoria como fallback.

## 📊 Funcionalidades

### Cotización Automática
- Selecciona materiales de la lista pre-cargada
- Agrega mano de obra con tarifas por hora
- Incluye especificaciones de planos
- Calcula automáticamente el presupuesto total

### Panel de Control
- Visualiza todos los proyectos
- Gestiona materiales y costos
- Actualiza información de proyectos

### API REST
- `GET /api/materials` - Lista todos los materiales
- `POST /api/calculate` - Calcula presupuesto
- `GET /api/projects` - Lista proyectos
- `POST /api/projects` - Crea nuevo proyecto

## 🗄️ Base de Datos

La aplicación utiliza **MongoDB** si está disponible:
- Se conecta a `MONGO_URI` definido en `.env`
- Si MongoDB no está disponible, usa un **fallback en memoria** que permite arrancar sin configurar MongoDB
- Para datos persistentes, instala MongoDB o usa un URI remoto

## 🔧 Desarrollo

Para desarrollo con recarga automática:
```bash
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
VertexEC/
├── server/
│   ├── app.js              # Servidor principal
│   ├── config/
│   │   └── db.js          # Configuración de base de datos
│   ├── models/
│   │   └── comment.js     # Modelo MongoDB (opcional)
│   └── routes/
│       └── api.js         # Rutas de la API
├── public/
│   ├── index.html         # Interfaz principal
│   ├── css/
│   │   └── styles.css     # Estilos
│   └── js/
│       └── app.js         # Lógica del frontend
├── package.json
├── .env.example           # Ejemplo de variables de entorno
└── README.md
```

## 🎯 Próximas Funcionalidades

- Sistema de usuarios y autenticación
- Exportación de cotizaciones a PDF
- Historial de versiones de planos
- Integración con proveedores externos
- Dashboard con estadísticas

## Uso

- Accede a `http://localhost:3000` en tu navegador.
- Usa el formulario para ingresar datos y calcular presupuestos.
- El panel de control muestra el estado de los proyectos.

## Tecnologías

- Frontend: HTML5, CSS3, Bootstrap, JavaScript
- Backend: Node.js, Express
- Bases de datos: MongoDB (con fallback en memoria)