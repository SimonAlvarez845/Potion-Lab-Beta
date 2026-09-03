<div align="center">

# **Potion Lab** 
 
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![JavaScript](https://img.shields.io/badge/JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
[![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5&logoColor=white&style=for-the-badge)](https://developer.mozilla.org/es/docs/Web/HTML)
![Status](https://img.shields.io/badge/Status-Finished-success?style=for-the-badge)

</div>

## ­ƒôï Tabla de contenidos
 
- [­ƒôû Sobre el proyecto](#-sobre-el-proyecto)
- [Ô£¿ Funcionalidades](#-funcionalidades)
- [­ƒÅù´©Å Estructura del proyecto](#´©Å-estructura-del-proyecto)
- [­ƒº® L├│gica de votaci├│n](#-l├│gica-de-votaci├│n)
- [­ƒù║´©Å Rutas](#´©Å-rutas)
- [ÔûÂ´©Å Instalaci├│n y uso](#´©Å-instalaci├│n-y-uso)
---
 
## ­ƒôû Sobre el proyecto
 
> SPA construida en un mundo de alquimia ca├│tica, donde los aprendices necesitan un lugar para colaborar en la creaci├│n de pociones, votar ingredientes y decidir qu├® f├│rmula es la m├ís poderosa. Actualmente usan grupos de WhatsApp donde las opiniones se pierden y nadie recuerda qui├®n propuso qu├®. La plataforma debe organizar la locura creativa y producir un resultado confiable: la poci├│n definitiva.
 
Potion Lab corre 100% del lado del cliente: no hay backend, todo el estado de usuarios, gremios, f├│rmulas y sesiones vive en `localStorage`. El foco del proyecto no fue solo "que funcione", sino separar con claridad **l├│gica** (funciones) de **presentaci├│n** (componentes), y modelar un sistema de votaci├│n con reglas de negocio reales en vez de un simple tracker, una App entera capaz de coordinar el flujo completo de estos gremios alqu├¡micos.
 
---
 
## Ô£¿ Funcionalidades
 
| ­ƒöº Funcionalidad | ­ƒôØ Descripci├│n | Ô£à Estado |
|---|---|---|
| ­ƒºÖ Gremios | Creaci├│n, directorio y gesti├│n de miembros/solicitudes | Done |
| ­ƒº¬ F├│rmulas | Propuesta, cat├ílogo y filtrado por estado | Done |
| ­ƒù│´©Å Votaci├│n por categor├¡a | `ingrediente`, `metodo` y `frasco`, con peso seg├║n especialidad | Done |
| ­ƒÜ½ Vetos | Exclusi├│n autom├ítica de opciones vetadas del conteo | Done |
| ÔÜû´©Å Desempate en cascada | Catador Oficial ÔåÆ Gran Maestre ÔåÆ azar determinista | Done |
| ­ƒôÜ Grimorio | Registro hist├│rico inmutable de pociones aprobadas | Done |
| ­ƒÅå Ranking | Clasificaci├│n de alquimistas y gremios destacados | Done |
| ­ƒÆ¥ Persistencia reactiva | Hook propio sobre `localStorage` con lectura perezosa | Done |
 
---
 
## ­ƒÅù´©Å Estructura del proyecto
 
```txt
src/
Ôö£ÔöÇÔöÇ components/
Ôöé   Ôö£ÔöÇÔöÇ authentication/  # Control de acceso e inicio de sesi├│n
Ôöé   Ôö£ÔöÇÔöÇ common/          # Modales, avisos, badges e insignias
Ôöé   Ôö£ÔöÇÔöÇ formula/         # Paneles de votaci├│n y tarjetas de f├│rmulas
Ôöé   Ôö£ÔöÇÔöÇ gremio/          # Directorio y gesti├│n de integrantes
Ôöé   ÔööÔöÇÔöÇ layout/          # Header, Nav y estructura general
Ôö£ÔöÇÔöÇ context/             # UsuarioContext (estado global de sesi├│n)
Ôö£ÔöÇÔöÇ data/                # seedData de prueba
Ôö£ÔöÇÔöÇ hooks/               # useLocalStorage
Ôö£ÔöÇÔöÇ pages/               # Vistas vinculadas a React Router
Ôö£ÔöÇÔöÇ styles/              # CSS modular con clases sem├ínticas
Ôö£ÔöÇÔöÇ utils/               # Motores de voto, desempate y formateo
Ôö£ÔöÇÔöÇ App.jsx
ÔööÔöÇÔöÇ index.css
```
 
---
 
## ­ƒº® L├│gica de votaci├│n
 
El coraz├│n del sistema es un motor de c├│mputo aislado en `src/utils/`, dividido en tres pasos:
 
| Paso | Funci├│n | Qu├® hace |
|---|---|---|
| ÔÜû´©Å Ponderaci├│n | `obtenerPesoVoto` | Especialista en la categor├¡a ÔåÆ `x1.2` ┬À Maestro Cervecero ÔåÆ `x1.2` transversal ┬À Catador Oficial ÔåÆ `x2` sobre el total |
| ­ƒÜ½ Filtro de vetos | normalizaci├│n | Marca `vetada: true` y excluye del conteo; ajusta el residuo porcentual en el ├║ltimo elemento para cerrar siempre en 100% |
| ­ƒÄ▓ Desempate | `resolverEmpate` | 1) coincide con el voto del Catador Oficial ÔåÆ 2) coincide con el Gran Maestre ÔåÆ 3) elecci├│n aleatoria determinista |
 
---
 
## ­ƒù║´©Å Rutas 
 
| Ruta | Prop├│sito |
|---|---|
| `/` | Dashboard con m├®tricas del laboratorio |
| `/gremios` ┬À `/gremios/:id` | Directorio y gesti├│n de un gremio |
| `/formulas` ┬À `/formulas/nueva` | Cat├ílogo y registro de f├│rmulas |
| `/formulas/:id` | Votaci├│n, vetos y destilaci├│n |
| `/grimorio` | Historial de pociones aprobadas |
| `/ranking` | Clasificaci├│n de alquimistas |
| `/perfil` | Configuraci├│n de sesi├│n |
 
---
 
## ÔûÂ´©Å Instalaci├│n y uso
 
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

[![typing](https://readme-typing-svg.demolab.com?font=Georgia&size=22&duration=3000&pause=1000&color=FFFFFF&center=true&vCenter=true&width=600&lines=Construido+con+%E2%98%95+y+muchos+errores)](https://git.io/typing-svg)

</div>
