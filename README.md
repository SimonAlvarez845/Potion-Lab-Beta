<div align="center">

# **Potion Lab**

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge\&logo=reactrouter\&logoColor=white)
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

---

## 📖 Sobre el proyecto

> SPA construida en un mundo de alquimia caótica, donde los aprendices necesitan un lugar para colaborar en la creación de pociones, votar ingredientes y decidir qué fórmula es la más poderosa. Actualmente usan grupos de WhatsApp donde las opiniones se pierden y nadie recuerda quién propuso qué. La plataforma debe organizar la locura creativa y producir un resultado confiable: la poción definitiva.

Potion Lab corre 100% del lado del cliente: no hay backend, todo el estado de usuarios, gremios, fórmulas y sesiones vive en `localStorage`. El foco del proyecto no fue solo "que funcione", sino separar con claridad **lógica** (funciones) de **presentación** (componentes), y modelar un sistema de votación con reglas de negocio reales en vez de un simple tracker, una App entera capaz de coordinar el flujo completo de estos gremios alquímicos.

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
| 💾 Persistencia reactiva   | Hook propio sobre `localStorage` con lectura perezosa           | Done     |

---

## 🏗️ Estructura del proyecto

```txt
src/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
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

```bash
git clone https://github.com/SimonAlvarez845/Potion-Lab-Beta.git
cd Potion-Lab-Beta

npm install
npm run dev

npm run lint
npm run build
```

Requisito previo: **Node.js Version 22.12** o superior.

<div align="center">

[![typing](https://readme-typing-svg.demolab.com?font=Georgia\&size=22\&duration=3000\&pause=1000\&color=FFFFFF\&center=true\&vCenter=true\&width=600\&lines=Construido+con+%E2%98%95+y+muchos+errores)](https://git.io/typing-svg)

</div>
