# 🏗️ VertexEC: Sistema de Cotización de Planos y Construcción

Aplicación web diseñada para la automatización de presupuestos de construcción, centralizando información técnica y eliminando errores de cálculo manual.

---

## 🚀 Características Principales

* **Cálculos en Tiempo Real:** Presupuestos dinámicos basados en materiales y mano de obra.
* **Base de Datos Inteligente:** Conexión automática a MongoDB con **fallback en memoria**.
* **Gestión de Proyectos:** Panel de control integrado para administración de obras.
* **API REST:** Arquitectura escalable lista para integraciones.
* **Interfaz Responsive:** Diseño optimizado con Bootstrap.

---

## 🛠️ Instalación y Uso Rápido

Sigue estos pasos para levantar el entorno local:

### 1. Clonar e Instalar
```bash
git clone <url-del-repo>
cd VertexEC
npm install

## 🚀 Requisitos Previos

Antes de comenzar la configuración, es indispensable que tu entorno de desarrollo cuente con **Node.js** en su versión 18.0.0 o superior para asegurar la compatibilidad con las últimas características de ECMAScript, contar con el gestor de paquetes **npm** en versión 9.0.0 o superior, tener instalado **Git** para la gestión de versiones y la clonación del repositorio, y opcionalmente disponer de una instancia de **MongoDB** (local o Atlas) si se requiere persistencia de datos a largo plazo, ya que de lo contrario el sistema activará de forma inteligente un motor de almacenamiento en memoria.

---

## 🛠️ Guía de Instalación Paso a Paso

Para iniciar con el proyecto, primero debes obtener una copia local ejecutando en tu terminal el comando `git clone <URL_DE_TU_REPOSITORIO>` y desplazarte al directorio raíz con `cd VertexEC`. Una vez dentro, debes instalar todas las dependencias del manifiesto ejecutando `npm install`, lo cual descargará paquetes críticos como **Express**, **Mongoose** y **Dotenv**. El siguiente paso es la configuración de las variables de entorno: debes generar tu archivo local a partir de la plantilla proporcionada; si utilizas un entorno **Bash (Linux/macOS)** ejecuta `cp .env.example .env`, pero si te encuentras en **Windows PowerShell** utiliza el comando `Copy-Item .env.example .env`. Finalmente, abre el archivo `.env` recién creado y define los valores de `PORT` (por defecto 3000), `MONGO_URI` (tu cadena de conexión) y `JWT_SECRET` para la seguridad de la sesión.

---

## 🏃 Lanzamiento del Proyecto

Para poner en marcha el servidor en un entorno de producción o pruebas finales, utiliza el comando estándar `npm start`, el cual inicializará el punto de entrada de la aplicación; si prefieres un flujo de trabajo de desarrollo ágil, ejecuta `npm run dev` para activar **Nodemon**, que monitorea cambios en el código y reinicia el proceso automáticamente. Una vez que la terminal indique que el servidor está escuchando, podrás acceder a la interfaz completa abriendo tu navegador en la dirección `http://localhost:3000`, donde verás el panel de control y el cotizador listos para operar.

---

## 📂 Arquitectura del Directorio

La estructura del software sigue un patrón organizado donde la carpeta `server` es el núcleo del backend, conteniendo `app.js` como servidor principal, `config/db.js` para la lógica de conexión híbrida, `models/` para los esquemas de Mongoose y `routes/api.js` para la definición de los puntos de enlace. Por otro lado, la carpeta `public` actúa como el servidor de archivos estáticos, albergando el `index.html` para la estructura, `css/styles.css` para el diseño visual y `js/app.js` para la manipulación del DOM y el consumo de la API, manteniendo así una separación clara de responsabilidades entre el cliente y el servidor.

---

## 🔗 Resumen de la API REST

El backend expone una interfaz de programación robusta con endpoints diseñados para el flujo de trabajo de construcción, destacando `GET /api/materials` para la recuperación del catálogo técnico, `POST /api/calculate` para el procesamiento lógico de los presupuestos enviados por el usuario, `GET /api/projects` para listar las cotizaciones almacenadas y `POST /api/projects` para la creación y persistencia de nuevos expedientes de obra, todos retornando respuestas en formato JSON con los códigos de estado HTTP correspondientes.

---

## ⚠️ Solución de Problemas (FAQ)

En caso de encontrar conflictos con el puerto de red, simplemente edita la variable `PORT` en tu archivo `.env` y reinicia el proceso. Si la aplicación lanza un aviso de **"Memory Fallback"**, significa que no pudo establecer conexión con MongoDB y está utilizando un array temporal en RAM para almacenar los datos; esto permite seguir probando la lógica de cotización, pero recuerda que los datos se perderán al apagar el servidor si no configuras una `MONGO_URI` válida. Además, asegúrate de tener acceso a internet en el primer arranque para que el frontend pueda cargar las librerías de **Bootstrap 5** y los iconos desde los CDNs externos.

---

## 🛠️ Stack Tecnológico

Este ecosistema está construido sobre un stack moderno que utiliza **Node.js** y **Express.js** para la lógica de servidor y middleware, **MongoDB** con el ODM **Mongoose** para la gestión de datos flexible, y un frontend purista basado en **HTML5**, **CSS3** y **JavaScript (ES6+)** potenciado con **Bootstrap 5** para garantizar una experiencia de usuario responsiva y profesional en cualquier dispositivo.
