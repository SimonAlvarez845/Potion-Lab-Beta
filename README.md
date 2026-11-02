<div align="center">

# **Full Stack: Potion Lab - David Botero & Simon Alvarez**
  
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JS-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge\&logo=css\&logoColor=white)
[![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5\&logoColor=white\&style=for-the-badge)](https://developer.mozilla.org/es/docs/Web/HTML)
![Status](https://img.shields.io/badge/Status-Finished-success?style=for-the-badge)

<img src="docs/codex-hero.svg" width="100%" alt="Potion Lab — The Alchemist's Codex, portada de fantasía violeta y dorada" />


| Servicio | Plataforma | Enlace |
|---|---|---|
| Frontend | Netlify | [  Potion Lab](https://potionlab.netlify.app) |
| Backend | Render | [API Potion Lab](https://potion-lab-beta.onrender.com/api/salud) |
| Swagger | Render | [Documentación](https://potion-lab-beta.onrender.com/api/docs) |
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
| 🗳️ Votación por categoría  | `ingrediente`, `metodo` y `frasco`, con peso según especialidad | Done     |
| 🚫 Vetos                   | Exclusión automática de opciones vetadas del conteo             | Done     |
| ⚖️ Desempate en cascada    | Catador Oficial → Gran Maestre → azar determinista              | Done     |
| 📚 Grimorio                | Registro histórico inmutable de pociones aprobadas              | Done     |
| 🏆 Ranking                 | Clasificación de alquimistas y gremios destacados               | Done     |
| 💾 Persistencia            | API REST y MongoDB Atlas; existen utilidades locales en el frontend | Done |
| 🏆 Ranking | Clasificación de alquimistas y gremios | Done |
| 🔐 Autenticación | Registro, inicio de sesión y acceso mediante JWT | Done |
| 🛡️ Autorización | Validación de permisos según membresía, rol y operación | Done |
| ⚡ Tiempo real | Notificaciones de actualización de votaciones con Socket.IO | Done |
| 💾 Persistencia | Almacenamiento de los recursos mediante MongoDB Atlas | Done |
| 📖 Swagger | Documentación interactiva de la API REST | Done |
| 🌐 Producción | Frontend en Netlify y Backend en Render | Done |

---

## 🏗️ Estructura del proyecto

Potion Lab sigue una arquitectura **cliente-servidor**, con separación entre frontend, API REST y base de datos.

```text
Potion-Lab-Beta/
├── frontend/
│   └── public/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── docs/
│   ├── ARQUITECTURA.md
│   └── openapi.json
│
├── package.json
└── README.md
```

> La estructura representa los módulos principales. El repositorio puede contener archivos adicionales de configuración, pruebas y documentación.

```mermaid
flowchart TB
    FE["FRONTEND<br/>React + Vite"]
    BE["BACKEND<br/>Express"]
    DB[("BASE DE DATOS<br/>MongoDB Atlas")]

    FE -->|"Solicitudes"| BE
    BE -->|"Persistencia"| DB

    classDef front fill:#dbeafe,stroke:#2563eb,color:#1e40af,stroke-width:2px
    classDef back fill:#dcfce7,stroke:#16a34a,color:#166534,stroke-width:2px
    classDef data fill:#f3e8ff,stroke:#9333ea,color:#6b21a8,stroke-width:2px

    class FE front
    class BE back
    class DB data
```

- El frontend utiliza Axios para consumir la API REST y enviar el JWT en las solicitudes autenticadas.
- El backend verifica los permisos, ejecuta las operaciones y almacena los cambios en MongoDB Atlas.
- Socket.IO permite notificar las actualizaciones de votación a los usuarios conectados.

---

## 🧩 Lógica de votación

La votación constituye uno de los componentes centrales del proyecto.

### Secuencia de una votación:

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as React
    participant A as Express
    participant D as MongoDB

    U->>F: Realiza un voto
    F->>A: Envía solicitud con JWT
    A->>A: Valida permisos y voto
    A->>D: Guarda el voto
    D-->>A: Confirma operación
    A-->>F: Devuelve resultado
    F-->>U: Actualiza la interfaz
```

### Ciclo de vida de una fórmula:

```mermaid
stateDiagram-v2
    [*] --> proposal
    proposal --> voting
    voting --> closed
    closed --> distilled
    distilled --> [*]
```

Cada formula puede recibir votos en tres categorías:

- **🌿 Ingrediente:** componente principal de la poción.
- **🔮 Método:** procedimiento de preparación.
- **🧴 Frasco:** recipiente utilizado.
  
### Ponderación de votos

El sistema calcula los resultados de las votaciones aplicando las siguientes reglas:

- **⚖️ Ponderación:** los especialistas reciben un peso de `x1.2` en su categoría, el Maestro Cervecero `x1.2` transversal y el Catador Oficial `x2` sobre el peso correspondiente.
- **🚫 Vetos:** las opciones vetadas se excluyen del conteo de votos.
- **🎲 Desempates:** se prioriza el voto del Catador Oficial, luego el del Gran Maestre y, si persiste el empate, se aplica una selección determinista.

---

## 🗺️ Rutas


<div align="center">

<table>
  <thead>
    <tr>
      <th>Ruta</th>
      <th>Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>/</code></td><td>Panel principal del laboratorio</td></tr>
    <tr><td><code>/gremios</code></td><td>Directorio de gremios</td></tr>
    <tr><td><code>/gremios/:gremioId</code></td><td>Detalle y administración de un gremio</td></tr>
    <tr><td><code>/formulas</code></td><td>Catálogo de fórmulas</td></tr>
    <tr><td><code>/formulas/nueva</code></td><td>Creación de fórmulas</td></tr>
    <tr><td><code>/formulas/:formulaId</code></td><td>Detalle, votaciones y gestión de una fórmula</td></tr>
    <tr><td><code>/grimorio</code></td><td>Historial de pociones destiladas</td></tr>
    <tr><td><code>/ranking</code></td><td>Clasificación de alquimistas y gremios</td></tr>
    <tr><td><code>/perfil</code></td><td>Perfil del usuario</td></tr>
  </tbody>
</table>

</div>

---

## ▶️ Instalación y uso

### Requisitos previos

- Node.js **22.12 o superior** y npm.
- Un clúster de **MongoDB Atlas** accesible.
- Credenciales propias para MongoDB. **Nunca publiques el archivo `.env` ni los tokens JWT.**
- Un editor de código, como VS Code.

### 1. Descargar el proyecto

```bash
git clone https://github.com/SimonAlvarez845/Potion-Lab-Beta.git
cd Potion-Lab-Beta
```

### 2. Configurar el Backend

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

También puedes utilizar `npm start` para ejecutarlo sin Nodemon. Espera los mensajes de conexión a la base de datos y de inicio del servidor.

Comprueba la API en [http://localhost:3000/api/salud](http://localhost:3000/api/salud).

### 3. Iniciar el Frontend

Abre **otra terminal** desde la raíz del proyecto e instala sus dependencias:

```bash
npm install
```

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```dotenv
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Estas variables permiten conectar el frontend con la API REST y el servidor Socket.IO.

Inicia el frontend:

```bash
npm run dev
```

El frontend de Vite suele estar disponible en [http://localhost:5173](http://localhost:5173).

Los comandos `npm run lint` y `npm run build` permiten comprobar el código y generar la compilación de producción del frontend.

> **Nota:** para utilizar todas las funcionalidades es necesario mantener encendidos el frontend y el backend, además de contar con una conexión válida a MongoDB Atlas.

---

## 📖 Documentación de la API con Swagger

Con el **backend encendido**, abre:

- **Swagger UI:** [http://localhost:3000/api/docs/](http://localhost:3000/api/docs/)
- **OpenAPI JSON:** [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

También puedes consultar la documentación desplegada en producción:

- **Swagger UI:** [https://potion-lab-beta.onrender.com/api/docs](https://potion-lab-beta.onrender.com/api/docs)
- **OpenAPI JSON:** [https://potion-lab-beta.onrender.com/api/openapi.json](https://potion-lab-beta.onrender.com/api/openapi.json)

Swagger documenta las operaciones de la API en los módulos de sistema, autenticación, usuarios, gremios, fórmulas, votaciones, destilación y grimorio.

Para probar rutas protegidas, ejecuta primero `POST /api/auth/register` o `POST /api/auth/login`. Copia el `token` devuelto y pulsa **Authorize** en Swagger; pega el token JWT sin añadir manualmente la palabra `Bearer`. Después utiliza **Try it out → Execute** en la ruta deseada.

**Precaución:** las operaciones `POST`, `PUT`, `PATCH` y `DELETE` pueden modificar datos reales en MongoDB. Para una evaluación académica se recomienda utilizar usuarios y recursos de demostración.

---

<div align="center">

[![typing](https://readme-typing-svg.demolab.com?font=Georgia&size=22&duration=3000&pause=1000&color=FFFFFF&center=true&vCenter=true&width=600&lines=Construido+con+%E2%98%95+y+muchos+errores)](https://git.io/typing-svg)

</div>
