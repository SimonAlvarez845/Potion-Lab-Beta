<div align="center">

# **Potion Lab - David Botero & Simon Alvarez**
  
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JS-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge\&logo=css\&logoColor=white)
[![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5\&logoColor=white\&style=for-the-badge)](https://developer.mozilla.org/es/docs/Web/HTML)
![Status](https://img.shields.io/badge/Status-Finished-success?style=for-the-badge)

</div>

## 📋 Tabla de contenidos

* [📖 Sobre el proyecto](#-sobre-el-proyecto)
* [✨ Funcionalidades](#-funcionalidades)
* [🏗️ Estructura del proyecto](#️-estructura-del-proyecto)
* [🧩 Lógica de votación](#-lógica-de-votación)
* [🗺️ Rutas](#️-rutas)
* [▶️ Instalación y uso](#️-instalación-y-uso)
* [📖 Documentación de la API con Swagger](#-documentación-de-la-api-con-swagger)

---

## 📖 Sobre el proyecto

> SPA construida en un mundo de alquimia caótica, donde los aprendices necesitan un lugar para colaborar en la creación de pociones, votar ingredientes y decidir qué fórmula es la más poderosa. Actualmente usan grupos de WhatsApp donde las opiniones se pierden y nadie recuerda quién propuso qué. La plataforma debe organizar la locura creativa y producir un resultado confiable: la poción definitiva.

Potion Lab cuenta con un frontend desarrollado con React y Vite y una API REST en Node.js y Express que utiliza MongoDB Atlas para almacenar los datos y JWT para autenticar las peticiones. El proyecto separa la interfaz, las rutas, los controladores, los servicios y los modelos de datos.

---

## ✨ Funcionalidades

| 🔧 Funcionalidad           | 📝 Descripción                                                  | ✅ Estado |
| -------------------------- | --------------------------------------------------------------- | -------- |
| 🧙 Gremios                 | Creación, directorio y gestión de miembros/solicitudes          | Done     |
| 🧪 Fórmulas                | Propuesta, catálogo y filtrado por estado                       | Done     |
| 🗳️ Votación por categoría | `ingrediente`, `metodo` y `frasco`, con peso según especialidad | Done     |
| 🚫 Vetos                   | Exclusión automática de opciones vetadas del conteo             | Done     |
| ⚖️ Desempate en cascada    | Catador Oficial → Gran Maestre → azar determinista              | Done     |
| 📚 Grimorio                | Registro histórico inmutable de pociones aprobadas              | Done     |
| 🏆 Ranking                 | Clasificación de alquimistas y gremios destacados               | Done     |
| 💾 Persistencia            | API REST y MongoDB Atlas; existen utilidades locales en el frontend | Done |

---

## 🏗️ Estructura del proyecto

```txt
src/
├── components/
│   ├── authentication/  # Control de acceso e inicio de sesión
│   ├── common/          # Modales, avisos, badges e insignias
│   ├── formula/         # Paneles de votación y tarjetas de fórmulas
│   ├── gremio/          # Directorio y gestión de integrantes
│   └── layout/          # Header, Nav y estructura general
├── context/             # UsuarioContext (estado global de sesión)
├── data/                # seedData de prueba
├── hooks/               # useLocalStorage
├── pages/               # Vistas vinculadas a React Router
├── styles/              # CSS modular con clases semánticas
├── utils/               # Motores de voto, desempate y formateo
├── App.jsx
└── index.css
```

---

## 🧩 Lógica de votación

El corazón del sistema es un motor de cómputo aislado en `src/utils/`, dividido en tres pasos:

| Paso               | Función           | Qué hace                                                                                                                  |
| ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ⚖️ Ponderación     | `obtenerPesoVoto` | Especialista en la categoría → `x1.2` · Maestro Cervecero → `x1.2` transversal · Catador Oficial → `x2` sobre el total    |
| 🚫 Filtro de vetos | normalización     | Marca `vetada: true` y excluye del conteo; ajusta el residuo porcentual en el último elemento para cerrar siempre en 100% |
| 🎲 Desempate       | `resolverEmpate`  | 1) coincide con el voto del Catador Oficial → 2) coincide con el Gran Maestre → 3) elección aleatoria determinista        |

---

## 🗺️ Rutas

| Ruta                            | Propósito                              |
| ------------------------------- | -------------------------------------- |
| `/`                             | Dashboard con métricas del laboratorio |
| `/gremios` · `/gremios/:id`     | Directorio y gestión de un gremio      |
| `/formulas` · `/formulas/nueva` | Catálogo y registro de fórmulas        |
| `/formulas/:id`                 | Votación, vetos y destilación          |
| `/grimorio`                     | Historial de pociones aprobadas        |
| `/ranking`                      | Clasificación de alquimistas           |
| `/perfil`                       | Configuración de sesión                |

---

## ▶️ Instalación y uso

### Requisitos previos

- Node.js **22.12 o superior** y npm.
- Un clúster de **MongoDB Atlas** activo y accesible desde la IP del equipo.
- Credenciales propias para MongoDB. **Nunca publiques el archivo `.env` ni los tokens JWT.**

### 1. Descargar el proyecto

```bash
git clone https://github.com/SimonAlvarez845/Potion-Lab-Beta.git
cd Potion-Lab-Beta
```

### 2. Configurar el backend

En una terminal, entra a `backend` e instala sus dependencias:

```bash
cd backend
npm install
```

Copia `backend/.env.example` como `backend/.env` y sustituye los valores de ejemplo:

```dotenv
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@CLUSTER.mongodb.net/potion_lab
JWT_SECRET=CAMBIAR_POR_UN_SECRETO_LARGO_Y_PRIVADO
```

`MONGODB_URI` se obtiene desde MongoDB Atlas, en **Connect → Drivers**. Autoriza tu IP en **Network Access** y verifica que el clúster esté activo. La contraseña real debe permanecer exclusivamente en el `.env` local.

Inicia el servidor:

```bash
npm run dev
```

También puedes utilizar `npm start` para ejecutarlo sin Nodemon. Espera los mensajes de conexión a la base de datos y de inicio del servidor. Comprueba la API en [http://localhost:3000/api/salud](http://localhost:3000/api/salud).

### 3. Iniciar el frontend

Abre **otra terminal** desde la raíz del proyecto:

```bash
npm install
npm run dev
```

El frontend de Vite suele estar disponible en [http://localhost:5173](http://localhost:5173). Los comandos `npm run lint` y `npm run build` permiten comprobar el código y generar la compilación de producción del frontend.

> **Nota:** iniciar el frontend y el backend no implica que estén integrados entre sí. Comprueba el estado de la conexión frontend–API antes de evaluar flujos completos desde la interfaz.

## 📖 Documentación de la API con Swagger

Con el **backend encendido**, abre:

- **Swagger UI:** [http://localhost:3000/api/docs/](http://localhost:3000/api/docs/)
- **OpenAPI JSON:** [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

Swagger documenta las **24 operaciones** de la API en los módulos de sistema, autenticación, usuarios, gremios, fórmulas, votaciones, destilación y grimorio.

Para probar rutas protegidas, ejecuta primero `POST /api/auth/register` o `POST /api/auth/login`. Copia el `token` devuelto y pulsa **Authorize** en Swagger; pega el token JWT sin añadir manualmente la palabra `Bearer`. Después utiliza **Try it out → Execute** en la ruta deseada.

**Precaución:** las operaciones `POST`, `PUT`, `PATCH` y `DELETE` pueden modificar datos reales en MongoDB. Para una evaluación académica se recomienda una base de datos y usuarios de demostración, independientes de los datos que quieras conservar.

La documentación adicional del backend está en [backend/docs/README.md](backend/docs/README.md).

---

<div align="center">

[![typing](https://readme-typing-svg.demolab.com?font=Georgia\&size=22\&duration=3000\&pause=1000\&color=FFFFFF\&center=true\&vCenter=true\&width=600\&lines=Construido+con+%E2%98%95+y+muchos+errores)](https://git.io/typing-svg)

</div>
