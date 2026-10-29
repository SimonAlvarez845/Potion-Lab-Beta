import { useEffect, useState, useContext } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Link, Route, Routes } from "react-router-dom";

import Acceso from "./components/authentication/Acceso";
import Aviso from "./components/common/Aviso";
import EstadoVacio from "./components/common/EstadoVacio";
import LayoutPrincipal from "./components/layout/LayoutPrincipal";

import UsuarioContext from "./context/UsuarioContext";
import { SocketContext } from "./context/SocketContext";

import {
  iniciarSesionAPI,
  obtenerMiPerfilAPI,
  registrarUsuarioAPI,
} from "./services/authService";
import {
  obtenerUsuariosAPI,
  actualizarPerfilAPI,
} from "./services/usuarioService";
import {
  obtenerGremiosAPI,
  crearGremioAPI,
  unirseAGremioAPI,
  cambiarRolGremioAPI,
  nombrarCatadorAPI,
  retirarMiembroAPI,
} from "./services/gremioService";
import {
  obtenerFormulasAPI,
  obtenerFormulaAPI,
  crearFormulaAPI,
  abrirVotacionAPI,
  votarFormulaAPI,
  cerrarVotacionAPI,
  destilarFormulaAPI,
  vetarOpcionAPI,
} from "./services/formulaService";
import { obtenerGrimorioAPI } from "./services/grimorioService";

import { CUENTAS_DEMO } from "./data/seedData";

import useLocalStorage from "./hooks/useLocalStorage";

import FormulaDetallePage from "./pages/FormulaDetallePage";
import FormulasPage from "./pages/FormulasPage";
import GremioDetallePage from "./pages/GremioDetallePage";
import GremiosPage from "./pages/GremiosPage";
import GrimorioPage from "./pages/GrimorioPage";
import NuevaFormulaPage from "./pages/NuevaFormulaPage";
import PerfilPage from "./pages/PerfilPage";
import RankingPage from "./pages/RankingPage";
import ResumenPage from "./pages/ResumenPage";

// App es el padre central. Sus responsabilidades son las siguientes:
// Mantiene el estado usando un custom hook con LocalStorage
// Controla la sesion del usuario y configura las rutas con React Router
// Contiene la logica del negocio y las operaciones principales (crear gremios, formulas, votar,etc)

function App() {
  // Obtenemos todos los estados guardados en MongoDB
  const [usuarios, setUsuarios] = useState([]);

  // Obtenemos el Socket de nuestro Context (se usa en algunos useEffect como el de formulas)
  const { socket } = useContext(SocketContext);

  const [cuentas, setCuentas] = useLocalStorage(
    "potionlab-v2-cuentas",
    CUENTAS_DEMO,
  );

  // Toma las cuentas demo guardadas para mostrar sus correos actuales en Acceso.
  const cuentasDemoActuales = CUENTAS_DEMO.map(
    (cuentaDemo) =>
      cuentas.find((cuenta) => cuenta.usuarioId === cuentaDemo.usuarioId) ??
      cuentaDemo,
  );

  // Mantiene actualizadas las "cuentas demo" aunque el navegador tenga una version vieja guardada.
  // Las cuentas creadas por el usuario se conservan y evitan posibles bugs a usuarios que ya usaron una version anterior.

  useEffect(() => {
    setCuentas((anteriores) => {
      const cuentasCreadas = anteriores.filter(
        (cuenta) =>
          !CUENTAS_DEMO.some(
            (cuentaDemo) => cuentaDemo.usuarioId === cuenta.usuarioId,
          ),
      );

      // Mantenemos "sincronizados" el usuario activo, la lista de usuarios y las cuentas demo para que todos tengan siempre el mismo correo.
      const cuentasDemoActualizadas = CUENTAS_DEMO.map((cuentaDemo) => ({
        ...cuentaDemo,
        email:
          usuarios.find((usuario) => usuario.id === cuentaDemo.usuarioId)
            ?.email ?? cuentaDemo.email,
      }));

      // combinamos los dos arrays y ponemos el de cuentasCreadas al final para que lo nuevo tenga prioridad
      return [...cuentasDemoActualizadas, ...cuentasCreadas];
    });
  }, [setCuentas, usuarios]);
  // debe repetirse cada que cambie usuarios o se modifique el setter de la cuenta

  // el estado de la sesion del usuario depende del JWT
  const [usuarioActivo, setUsuarioActivo] = useState(null);

  // estado que evita mostrar el login mientras verificamos un token guardado.
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    if (!usuarioActivo) return;

    async function cargarUsuarios() {
      try {
        // Consultamos la lista real usando el JWT.
        const lista = await obtenerUsuariosAPI();
        setUsuarios(lista);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        mostrarAviso("No fue posible cargar los usuarios.");
      }
    }

    cargarUsuarios();
  }, [usuarioActivo?.id]);

  useEffect(() => {
    async function recuperarSesion() {
      const token = localStorage.getItem("potionlab-token");

      if (!token) {
        setVerificandoSesion(false);
        return;
      }

      try {
        // El backend comprueba si el JWT sigue siendo válido.
        const usuario = await obtenerMiPerfilAPI();
        setUsuarioActivo(usuario);
      } catch (error) {
        // Solo eliminamos el token si fue rechazado.
        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("potionlab-token");
        }
        console.error("No se pudo recuperar la sesión:", error);
      } finally {
        setVerificandoSesion(false);
      }
    }

    recuperarSesion();
  }, []);

  // Almacenamos por separado los gremios reales mientras migramos la interfaz.
  const [gremiosAPI, setGremiosAPI] = useState([]);

  // Consultamos MongoDB cuando existe una sesion autenticada.
  useEffect(() => {
    if (!usuarioActivo) {
      setGremiosAPI([]);
      return;
    }

    async function cargarGremios() {
      try {
        const lista = await obtenerGremiosAPI();
        setGremiosAPI(lista);
      } catch (error) {
        console.error("Error al cargar gremios:", error);
        mostrarAviso("No fue posible cargar los gremios.");
      }
    }

    cargarGremios();
  }, [usuarioActivo?.id]);

  // Actualiza un gremio en el estado usando la respuesta de MongoDB.
  function actualizarGremioAPI(gremioActualizado) {
    setGremiosAPI((anteriores) => {
      const existe = anteriores.some(
        (gremio) => gremio.id === gremioActualizado.id,
      );

      if (!existe) {
        return [gremioActualizado, ...anteriores];
      }

      return anteriores.map((gremio) =>
        gremio.id === gremioActualizado.id ? gremioActualizado : gremio,
      );
    });
  }

  // Formulas reales obtenidas desde MongoDB.
  const [formulasAPI, setFormulasAPI] = useState([]);

  // Estado de la consulta al Backend.
  const [cargandoFormulas, setCargandoFormulas] = useState(true);

  // Error de la consulta de formulas.
  const [errorFormulas, setErrorFormulas] = useState("");

  // Carga las formulas cuando hay una sesión activa.
  useEffect(() => {
    if (!usuarioActivo?.id) {
      setFormulasAPI([]);
      setCargandoFormulas(false);
      return;
    }

    let activo = true;

    async function cargarFormulas() {
      setCargandoFormulas(true);
      setErrorFormulas("");

      try {
        const datos = await obtenerFormulasAPI();

        if (activo) {
          setFormulasAPI(datos);
        }
      } catch (error) {
        if (activo) {
          setErrorFormulas(
            error.response?.data?.mensaje ||
              "No fue posible cargar las formulas.",
          );
        }
      } finally {
        if (activo) {
          setCargandoFormulas(false);
        }
      }
    }

    cargarFormulas();

    return () => {
      activo = false;
    };
  }, [usuarioActivo?.id]);

  // Escucha los votos de otros usuarios y sincroniza la formula desde MongoDB.
  useEffect(() => {
    if (!usuarioActivo?.id) return;

    async function actualizarVotacion({ formulaId }) {
      try {
        //  Consultamos la versión mas reciente de la formula.
        const formulaActualizada = await obtenerFormulaAPI(formulaId);

        // Actualizamos unicamente la formula que recibio votos.
        setFormulasAPI((anteriores) =>
          anteriores.map((formula) =>
            formula.id === formulaId ? formulaActualizada : formula,
          ),
        );
      } catch (error) {
        console.error("No se pudo sincronizar la votación:", error);
      }
    }

    // Registramos el evento mediante Socket.IO.
    socket.on("votacion:actualizada", actualizarVotacion);

    // Eliminamos el listener para evitar que se ejecute mas de una vez.
    return () => {
      socket.off("votacion:actualizada", actualizarVotacion);
    };
  }, [socket, usuarioActivo?.id]);

  const [aviso, setAviso] = useState("");

  // cada aviso se oculta despues de 4s en pantalla
  function mostrarAviso(mensaje) {
    setAviso(mensaje);
    window.setTimeout(() => setAviso(""), 4000);
  }

  const [grimorioAPI, setGrimorioAPI] = useState([]);

  // Consulta el Grimorio cuando hay una sesion activa.
  useEffect(() => {
    if (!usuarioActivo?.id) {
      setGrimorioAPI([]);
      return;
    }

    async function cargarGrimorio() {
      try {
        const pociones = await obtenerGrimorioAPI();
        setGrimorioAPI(pociones);
      } catch (error) {
        console.error("Error cargando el Grimorio:", error);
      }
    }

    cargarGrimorio();
  }, [usuarioActivo?.id]);

  // ------------------------------------------------------------------------------------------------
  // Toda funcion de App suele seguir el mismo flujo:
  // Busqueda -> Validacion -> Actualizacion Estado -> Guardado en localStorage
  // el ultimo paso en caso de que aplique seria lo equivalente a realizar una auditoria

  // Para actualizar arrays se repiten tres patrones:
  // agregar    -> spread (...)
  // modificar  -> map()
  // eliminar   -> filter()

  // Si el dato esta anidado, se combinan map() y spread para copiar
  // cada nivel sin modificar directamente el estado anterior

  // todo setter viene de useLocalStorage asi que al actualizar el
  // estado los datos tambien quedan almacenados en el mismo navegador
  // ------------------------------------------------------------------------------------------------

  // es la funcion que Acceso.jsx recibe como onLogin

  async function iniciarSesion(email, password) {
    try {
      // Express valida la contraseña y genera el JWT.
      const { usuario, token } = await iniciarSesionAPI(email, password);

      if (!usuario || !token) {
        return {
          ok: false,
          mensaje: "No se ha devuelto una sesión válida en este servidor.",
        };
      }

      // Guardamos el JWT para las siguientes peticiones.
      localStorage.setItem("potionlab-token", token);

      // Activamos el perfil correspondiente de MongoDB.
      setUsuarioActivo(usuario);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        mensaje:
          error.response?.data?.mensaje ||
          "No fue posible iniciar sesión. Revisa tus credenciales o el servidor.",
      };
    }
  }

  // Es la funcion que Acceso recibe como onRegister
  async function registrarUsuario(datos) {
    try {
      // Registramos el usuario directamente en MongoDB.
      await registrarUsuarioAPI(datos);

      // Iniciamos sesión con las credenciales recién registradas.
      return await iniciarSesion(datos.email, datos.password);
    } catch (error) {
      return {
        ok: false,
        mensaje:
          error.response?.data?.mensaje ||
          "No es posible registrar el usuario. Intentalo de nuevo.",
      };
    }
  }

  function cerrarSesion() {
    // Cerramos la sesión local y eliminamos el JWT, luego elegimos que interfaz mostrar cuando el usuario se salga.
    localStorage.removeItem("potionlab-token");
    setUsuarioActivo(null);
  }

  // Es la funcion que GremiosPage.jsx recibe como OnCreateGuild
  async function crearGremio(datos) {
    try {
      const nuevoGremio = await crearGremioAPI(datos);

      actualizarGremioAPI(nuevoGremio);

      mostrarAviso(
        nuevoGremio.tipo === "privado"
          ? `Gremio creado. Código de invitación: ${nuevoGremio.codigoInvitacion}`
          : "El nuevo gremio fue creado correctamente.",
      );

      return { ok: true, gremioId: nuevoGremio.id };
    } catch (error) {
      return {
        ok: false,
        mensaje:
          error.response?.data?.mensaje || "No fue posible crear el gremio.",
      };
    }
  }

  // necesita saber a que gremio quiero entrar y su codigo (si es publico lo tomamos como vacio)
  async function unirseAGremio(gremioId, codigo) {
    try {
      const gremioActualizado = await unirseAGremioAPI(gremioId, codigo);

      actualizarGremioAPI(gremioActualizado);
      mostrarAviso(`Ahora perteneces a ${gremioActualizado.nombre}.`);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        mensaje:
          error.response?.data?.mensaje || "No fue posible unirse al gremio.",
      };
    }
  }

  // Asciende un usuario dentro de un gremio a "moderador"
  async function cambiarRol(gremioId, usuarioId, nuevoRol) {
    try {
      const gremioActualizado = await cambiarRolGremioAPI(
        gremioId,
        usuarioId,
        nuevoRol,
      );

      actualizarGremioAPI(gremioActualizado);
      mostrarAviso(`Rol actualizado a ${nuevoRol}.`);

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible actualizar el rol.",
      );

      return { ok: false };
    }
  }

  // Asciende un unico usuario por gremio a "special" (realmente a veces manipula dos usuarios)
  async function nombrarCatador(gremioId, usuarioId) {
    try {
      const gremioActualizado = await nombrarCatadorAPI(gremioId, usuarioId);

      actualizarGremioAPI(gremioActualizado);
      mostrarAviso("Un nuevo Catador Oficial fue nombrado.");

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje ||
          "No fue posible nombrar al Catador oficial.",
      );

      return { ok: false };
    }
  }

  // Permite abandonar un gremio o expulsar miembros desde MongoDB.
  async function retirarMiembro(gremioId, usuarioId) {
    try {
      const gremioActualizado = await retirarMiembroAPI(gremioId, usuarioId);

      actualizarGremioAPI(gremioActualizado);

      mostrarAviso(
        usuarioId === usuarioActivo.id
          ? "Abandonaste el gremio correctamente."
          : "El miembro fue retirado del gremio.",
      );

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible retirar al miembro.",
      );

      return { ok: false };
    }
  }

  // los datos vienen del form de creacion de formula desde el backend, ahi se validan los permisos y se guarda la formula en MongoDB
  // Es la funcion que NuevaFormulaPage.jsx recibe como OnCreateFormula
  async function crearFormula(datos) {
    try {
      const nuevaFormula = await crearFormulaAPI({
        gremioId: datos.gremioId,
        nombrePocion: datos.nombrePocion.trim(),
        efectoDeseado: datos.efectoDeseado.trim(),
        dificultad: Number(datos.dificultad),
        fechaCierre: datos.fechaCierre,
      });

      // Actualiza la lista de formulas sin recargar la pagina.
      setFormulasAPI((anteriores) => [nuevaFormula, ...anteriores]);

      mostrarAviso("La fórmula fue guardada como propuesta.");

      return { ok: true, formulaId: nuevaFormula.id };
    } catch (error) {
      return {
        ok: false,
        mensaje:
          error.response?.data?.mensaje || "No fue posible crear esta formula.",
      };
    }
  }

  // Abre una votacion y actualiza la formula usando la respuesta de MongoDB.
  async function abrirVotacion(formulaId) {
    try {
      const formulaActualizada = await abrirVotacionAPI(formulaId);

      //  Reemplaza la formula anterior por su versión actualizada.
      setFormulasAPI((anteriores) =>
        anteriores.map((formula) =>
          formula.id === formulaId ? formulaActualizada : formula,
        ),
      );

      mostrarAviso("La votación fue abierta correctamente.");

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible abrir la votación.",
      );

      return { ok: false };
    }
  }

  // Guarda el voto en MongoDB y actualiza la formula mostrada.
  async function votarFormula(formulaId, categoriaId, opcionId) {
    try {
      // Enviamos al Backend la categoría y la opción elegidas.
      const formulaActualizada = await votarFormulaAPI(formulaId, {
        categoriaId,
        opcionId,
      });

      // Sustituimos la fórmula anterior por la respuesta del servidor.
      // Esto con el fin de actualizar los votos y resultados sin recargar la pagina.
      setFormulasAPI((anteriores) =>
        anteriores.map((formula) =>
          formula.id === formulaId ? formulaActualizada : formula,
        ),
      );

      return { ok: true };
    } catch (error) {
      // Mostramos la validacion o permisos del Backend.
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible registrar el voto.",
      );

      return { ok: false };
    }
  }

  // Cierra la votación en MongoDB y actualiza la formula en React.
  async function cerrarVotacion(formulaId) {
    try {
      const formulaActualizada = await cerrarVotacionAPI(formulaId);

      setFormulasAPI((anteriores) =>
        anteriores.map((formula) =>
          formula.id === formulaId ? formulaActualizada : formula,
        ),
      );

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible cerrar la votación.",
      );
      return { ok: false };
    }
  }

  // Es la función que FormulaDetallePage.jsx recibe como onDistill.
  // Su deber es convertir una fórmula cerrada en una pocion y guardarla en el grimorio.
  // Destila la formula en MongoDB y actualiza su estado en React.
  async function destilarFormulaMongoDB(formulaId) {
    try {
      const formulaActualizada = await destilarFormulaAPI(formulaId);

      setFormulasAPI((anteriores) =>
        anteriores.map((formula) =>
          formula.id === formulaId ? formulaActualizada : formula,
        ),
      );

      // Recarga el Grimorio para mostrar inmediatamente la nueva pocion.
      const pocionesActualizadas = await obtenerGrimorioAPI();
      setGrimorioAPI(pocionesActualizadas);

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible destilar la fórmula.",
      );
      return { ok: false };
    }
  }

  // Es la función que FormulaDetallePage.jsx recibe como onVeto.
  // Guarda el veto en MongoDB y sincroniza la formula en React.
  async function vetarOpcion(formulaId, categoriaId, opcionId) {
    try {
      const formulaActualizada = await vetarOpcionAPI(
        formulaId,
        categoriaId,
        opcionId,
      );

      setFormulasAPI((anteriores) =>
        anteriores.map((formula) =>
          formula.id === formulaId ? formulaActualizada : formula,
        ),
      );

      mostrarAviso("Veto aplicado correctamente.");
      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible aplicar el veto.",
      );

      return { ok: false };
    }
  }

  // Es la función que PerfilPage.jsx obtiene de UsuarioContext.
  async function guardarPerfil(datos) {
    try {
      // Normalizamos unicamente los campos incluidos en la actualización.
      const cambios = { ...datos };

      if (cambios.nombreCompleto !== undefined) {
        cambios.nombreCompleto = cambios.nombreCompleto.trim();
      }

      if (cambios.email !== undefined) {
        cambios.email = cambios.email.trim().toLowerCase();
      }

      if (cambios.avatarUrl !== undefined) {
        cambios.avatarUrl = cambios.avatarUrl.trim();
      }

      const actualizado = await actualizarPerfilAPI(cambios);

      // Sincronizamos la sesion y la lista de usuarios con MongoDB.
      setUsuarioActivo(actualizado);

      setUsuarios((anteriores) =>
        anteriores.map((usuario) =>
          usuario.id === actualizado.id ? actualizado : usuario,
        ),
      );

      mostrarAviso("Perfil actualizado correctamente.");

      return { ok: true };
    } catch (error) {
      const mensaje =
        error.response?.data?.errores?.[0]?.mensaje ||
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No fue posible actualizar el perfil.";

      mostrarAviso(mensaje);
      return { ok: false, mensaje };
    }
  }

  // Si el usuario es null entonces no esta activo y app solo devuelve el <p> como estado de carga, de lo contrario si debe aparecer toda la App
  if (verificandoSesion) {
    return <p>Verificando sesión...</p>;
  }

  if (!usuarioActivo) {
    return (
      <Acceso
        cuentasDemo={cuentasDemoActuales}
        onLogin={iniciarSesion}
        onRegister={registrarUsuario}
      />
    );
  }

  // Uso del Context:
  // Comparte usuarioActivo, cerrarSesion y guardarPerfil con los componentes que consuman UsuarioContext.
  return (
    <UsuarioContext.Provider
      value={{ usuarioActivo, cerrarSesion, guardarPerfil }}
    >
      <Routes>
        {/* LayoutPrincipal --> Home Page de la pagina*/}
        <Route element={<LayoutPrincipal />}>
          <Route
            index
            element={
              <ResumenPage
                formulas={formulasAPI}
                gremios={gremiosAPI}
                usuarios={usuarios}
              />
            }
          />
          <Route
            path="gremios"
            element={
              <GremiosPage
                gremios={gremiosAPI}
                onCreateGuild={crearGremio}
                onJoinGuild={unirseAGremio}
                usuario={usuarioActivo}
              />
            }
          />
          <Route
            path="gremios/:gremioId"
            element={
              <GremioDetallePage
                formulas={formulasAPI}
                gremios={gremiosAPI}
                onAppointTaster={nombrarCatador}
                onChangeRole={cambiarRol}
                onRemoveMember={retirarMiembro}
                usuario={usuarioActivo}
                usuarios={usuarios}
              />
            }
          />
          <Route
            path="formulas"
            element={
              <FormulasPage
                formulas={formulasAPI}
                gremios={gremiosAPI}
                usuarios={usuarios}
                usuario={usuarioActivo}
                cargando={cargandoFormulas}
                error={errorFormulas}
              />
            }
          />
          <Route
            path="formulas/nueva"
            element={
              <NuevaFormulaPage
                gremios={gremiosAPI}
                onCreateFormula={crearFormula}
                usuario={usuarioActivo}
              />
            }
          />
          <Route
            path="formulas/:formulaId"
            element={
              <FormulaDetallePage
                formulas={formulasAPI}
                gremios={gremiosAPI}
                onDistill={destilarFormulaMongoDB}
                onVeto={vetarOpcion}
                onVote={votarFormula}
                onOpenVoting={abrirVotacion}
                onCloseVoting={cerrarVotacion}
                usuario={usuarioActivo}
                usuarios={usuarios}
                cargando={cargandoFormulas}
                error={errorFormulas}
              />
            }
          />
          <Route
            path="grimorio"
            element={
              <GrimorioPage gremios={gremiosAPI} grimorio={grimorioAPI} />
            }
          />
          <Route
            path="ranking"
            element={
              <RankingPage usuarioActivo={usuarioActivo} usuarios={usuarios} />
            }
          />
          <Route path="perfil" element={<PerfilPage />} />
          <Route
            path="*"
            element={
              <EstadoVacio
                accion={
                  <Link className="estado-vacio-accion" to="/">
                    Volver al inicio
                  </Link>
                }
                descripcion="La ruta no existe"
                icono={FiAlertCircle}
                titulo="Pagina no encontrada"
              />
            }
          />
        </Route>
      </Routes>
      <Aviso mensaje={aviso} onCerrar={() => setAviso("")} />
    </UsuarioContext.Provider>
    // La linea 693 sera la que nos permita cerrar los avisos/notificaciones
  );
}

export default App;
