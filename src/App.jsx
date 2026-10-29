import { useEffect, useRef, useState, useContext } from "react";
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
import { obtenerUsuariosAPI } from "./services/usuarioService";
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
} from "./services/formulaService";

import {
  AUDITORIA_INICIAL,
  CUENTAS_DEMO,
  FORMULAS_INICIALES,
  GREMIOS_INICIALES,
  GRIMORIO_INICIAL,
  USUARIOS_DEMO,
  VOTOS_INICIALES,
} from "./data/seedData";
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
import { crearPocionDesdeFormula } from "./utils/formula";
import { esCatadorOficial, obtenerRol, puedeCrearFormula } from "./utils/roles";
import { obtenerPesoVoto } from "./utils/voting";

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

  // Estado temporal de gremios simulados.
  const [gremios, setGremios] = useLocalStorage(
    "potionlab-v2-gremios",
    GREMIOS_INICIALES,
  );

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

  const [formulas, setFormulas] = useLocalStorage(
    "potionlab-v2-formulas",
    FORMULAS_INICIALES,
  );

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

  // necesitamos guardar una memoria de como estaban las formulas antes para uno de los useEffect()
  const formulasAnterioresRef = useRef(formulas);

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

  const [votos, setVotos] = useLocalStorage(
    "potionlab-v2-votos",
    VOTOS_INICIALES,
  ); // es un objeto debe empezar vacio
  const [grimorio, setGrimorio] = useLocalStorage(
    "potionlab-v2-grimorio",
    GRIMORIO_INICIAL,
  );
  const [auditoria, setAuditoria] = useLocalStorage(
    "potionlab-v2-auditoria",
    AUDITORIA_INICIAL,
  );
  const [aviso, setAviso] = useState("");

  // cada aviso se oculta despues de 4s en pantalla
  function mostrarAviso(mensaje) {
    setAviso(mensaje);
    window.setTimeout(() => setAviso(""), 4000);
  }

  // Cierra automaticamente las formulas en estado voting cuya fecha limite ya paso
  useEffect(() => {
    const vencidas = formulas.filter(
      (formula) =>
        formula.estado === "voting" &&
        new Date(formula.fechaCierre).getTime() <= Date.now(),
    );

    if (vencidas.length === 0) return;

    // Si esta vencida, recorremos las fórmulas y comparamos sus ids para hallar la que este vencida, luego cambiamos el estado solamente de todas las que esten vencidas
    setFormulas((anteriores) =>
      anteriores.map((formula) => {
        const estaVencida = vencidas.some(
          (vencida) => vencida.id === formula.id,
        );
        return estaVencida ? { ...formula, estado: "closed" } : formula;
      }),
    );

    // Hacemos .filter() antes de mappear la auditoria porque las sanciones (como la que hay en el useEffect() de mas abajo pueden contener una sancion que ya fue registrada anteriormente en la auditoria.
    setAuditoria((anterior) => {
      const nuevos = vencidas
        .filter(
          (formula) =>
            !anterior.some(
              (evento) =>
                evento.formulaId === formula.id &&
                evento.titulo === "Cierre automático",
            ),
        )
        .map((formula) => ({
          id: `a-${formula.id}-${Date.now()}`,
          formulaId: formula.id,
          fecha: new Date().toISOString(),
          titulo: "Cierre automático",
          detalle:
            "La fecha límite fue alcanzada y el sistema cerró la votación.",
        }));
      return [...nuevos, ...anterior];
    });
  }, [formulas, setAuditoria, setFormulas]);

  // Revisa si el Catador Oficial voto durante sus primeras 48 horas. Si despues de esas 48 horas el Catador Oficial del gremio de esa fórmula no ha emitido ningun voto en esa fórmula, pierde su rol y pasa a "Aprendiz". Si emitio al menos un voto en cualquiera de las tres categorías, conserva su rol.
  useEffect(() => {
    const ahora = Date.now();

    // Recorre las fórmulas y construye una lista de objetos solo con las que generen sanciones. Esto se busco directamente ya que seria mas dificil hacerlo con un map puesto que quedariamos con un array de arrays.
    const sanciones = formulas.flatMap((formula) => {
      if (!formula.fechaAperturaVotacion) return [];

      // fechaAperturaVotacion esta guardada como texto por lo cual toca buscar como hacer el casteo para poder realizar "fecha actual" - "fecha apertura" >=  tiempo (en ms) de 48 horas
      const fechaApertura = new Date(formula.fechaAperturaVotacion).getTime();
      const pasaron48Horas =
        !Number.isNaN(fechaApertura) &&
        ahora - fechaApertura >= 48 * 60 * 60 * 1000;

      if (!pasaron48Horas) return [];

      const gremio = gremios.find((item) => item.id === formula.gremioId);
      const catador = gremio?.miembros.find(
        (miembro) => miembro.rol === "Catador oficial",
      );

      if (!catador) return [];

      // revise si el catador voto
      const votoCatador = votos[formula.id]?.[catador.usuarioId] ?? {};

      // si tiene al menos una categoria la formula no genera sancion
      if (Object.keys(votoCatador).length > 0) return [];

      return [
        {
          formulaId: formula.id,
          gremioId: gremio.id,
          usuarioId: catador.usuarioId,
        },
      ];
    });

    if (sanciones.length === 0) return;

    // recorre todos los gremios y, dentro de cada uno, recorre todos sus miembros para degradar únicamente al Catador sancionado a "Aprendiz"
    setGremios((anteriores) =>
      anteriores.map((gremio) => ({
        ...gremio,
        miembros: gremio.miembros.map((miembro) =>
          sanciones.some(
            (sancion) =>
              sancion.gremioId === gremio.id &&
              sancion.usuarioId === miembro.usuarioId,
          ) && miembro.rol === "Catador oficial"
            ? { ...miembro, rol: "Aprendiz" }
            : miembro,
        ),
      })),
    );

    setAuditoria((anterior) => {
      const nuevos = sanciones
        .filter(
          (sancion) =>
            !anterior.some(
              (evento) =>
                evento.formulaId === sancion.formulaId &&
                evento.usuarioId === sancion.usuarioId &&
                evento.titulo === "Catador removido",
            ),
        )
        .map((sancion) => ({
          id: `a-catador-${sancion.formulaId}-${Date.now()}`,
          formulaId: sancion.formulaId,
          usuarioId: sancion.usuarioId,
          fecha: new Date().toISOString(),
          titulo: "Catador removido",
          detalle:
            "El Catador Oficial perdio su rol al no votar durante las primeras 48 horas.",
        }));

      return nuevos.length > 0 ? [...nuevos, ...anterior] : anterior;
    });
  }, [formulas, gremios, votos, setAuditoria, setGremios]);

  // Detecta solo las formulas cuyo estado acaba de pasar de voting a closed
  // Useref() --> cajita donde React puede almacenar un valor entre renders sin provocar un render cuando ese valor cambia.
  useEffect(() => {
    // .current es donde useRef guarda su valor en memoria auxiliar
    const formulasAnteriores = formulasAnterioresRef.current;

    // buscamos solo las que pasen de voting a closed y deontro solo la version anterior de esa formula
    const recienCerradas = formulas.filter((formulaActual) => {
      const formulaAnterior = formulasAnteriores.find(
        (formula) => formula.id === formulaActual.id,
      );

      // guardamos solo las formulas que pasen, las demas las ignoramos
      return (
        formulaAnterior?.estado === "voting" &&
        formulaActual.estado === "closed"
      );
    });

    // al terminar de comparar quiero actualizar la memoria y decir que las formulas actuales pasan a ser mis anteriores para la proxima comparacion
    formulasAnterioresRef.current = formulas;

    // recorremos unicamente las que se acaban de cerrar y, por cada una, las destilamos automaticamente (por eso el true) lo cual nos lo exige el enunciado
    recienCerradas.forEach((formula) => {
      destilarFormula(formula.id, true);
    });
  }, [formulas]);

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

  // Destila la formula en MongoDB y actualiza su estado en React.
  async function destilarFormulaMongoDB(formulaId) {
    try {
      const formulaActualizada = await destilarFormulaAPI(formulaId);

      setFormulasAPI((anteriores) =>
        anteriores.map((formula) =>
          formula.id === formulaId ? formulaActualizada : formula,
        ),
      );

      return { ok: true };
    } catch (error) {
      mostrarAviso(
        error.response?.data?.mensaje || "No fue posible destilar la fórmula.",
      );
      return { ok: false };
    }
  }

  // Es la funcion que FormulaDetallePage.jsx recibe como onVote
  function votar(formulaId, categoriaId, opcionId) {
    // Busca formula, si existe busca gremio, si existe busca si usuario pertenece a gremio
    const formula = formulas.find((item) => item.id === formulaId);
    const gremio = gremios.find((item) => item.id === formula?.gremioId);

    const esMiembro = gremio?.miembros.some(
      (miembro) => miembro.usuarioId === usuarioActivo.id,
    );

    // Validacion: solo puede votar si la formula esta abierta y pertenece al gremio
    if (formula?.estado !== "voting" || !esMiembro) return;

    // Calculamos cuanto vale el voto del usuario en esta categoria.
    // Esto depende de su especialidad y de si es Catador Oficial.
    const peso = obtenerPesoVoto(
      usuarioActivo,
      categoriaId,
      esCatadorOficial(gremio, usuarioActivo.id),
    );

    // Actualizamos su estado, misma logica que forms pero con capas adicionales
    // porque votos ahora guarda:
    // formula -> usuario -> categoria -> { opcionId, peso }
    setVotos((anteriores) => ({
      ...anteriores,

      [formulaId]: {
        ...anteriores[formulaId],

        [usuarioActivo.id]: {
          ...(anteriores[formulaId]?.[usuarioActivo.id] ?? {}),

          [categoriaId]: {
            opcionId,
            peso,
          },
        },
      },
    }));

    mostrarAviso(
      "Tu elección fue registrada. Puedes cambiarla mientras siga abierta.",
    );
  }

  // Es la función que FormulaDetallePage.jsx recibe como onVeto.
  function vetarOpcion(formulaId, categoriaId, opcionId) {
    const formula = formulas.find((item) => item.id === formulaId);
    const gremio = gremios.find((item) => item.id === formula?.gremioId);

    // Un veto debe cancelarse si no existe la formula, no esta en estado de votacion, ya existe otro veto activo y no es catador oficial
    if (
      !formula ||
      formula.estado !== "voting" ||
      formula.veto ||
      !esCatadorOficial(gremio, usuarioActivo.id)
    ) {
      return;
    }

    //function votar La añade al principio al igual que el log
    setFormulas((anteriores) =>
      anteriores.map((item) =>
        item.id === formulaId
          ? {
              ...item,
              veto: {
                categoriaId,
                opcionId,
                usuarioId: usuarioActivo.id,
                fecha: new Date().toISOString(),
              },
            }
          : item,
      ),
    );
    setAuditoria((anterior) => [
      {
        id: `a-${Date.now()}`,
        formulaId,
        fecha: new Date().toISOString(),
        titulo: "Veto aplicado",
        detalle: `${usuarioActivo.nombreCompleto} utilizó su veto de Catador.`,
      },
      ...anterior,
    ]);
    mostrarAviso(
      "Veto aplicado. Solo puedes usar esta acción una vez por fórmula.",
    );
  }

  // Es la función que FormulaDetallePage.jsx recibe como onDistill.
  // Su deber es convertir una fórmula cerrada en una pocion y guardarla en el grimorio.
  function destilarFormula(formulaId, automatico = false) {
    const formula = formulas.find((item) => item.id === formulaId);
    const gremio = gremios.find((item) => item.id === formula?.gremioId);
    const rol = obtenerRol(gremio, usuarioActivo?.id);

    if (
      !formula ||
      formula.estado !== "closed" ||
      grimorio.some((pocion) => pocion.formulaId === formulaId) ||
      (!automatico && !["Gran Maestre", "Alquimista sénior"].includes(rol))
    ) {
      return;
    }

    // Se pasa el objeto entero de la formula
    const nuevaPocion = crearPocionDesdeFormula(
      formula,
      votos[formulaId] ?? {}, // Si no existen votos para una formula, usa un objeto vacio.
      gremio,
    );

    // Para actualizar el estado debemos agregarla al grimorio, marcar su estado y establecer una relacion para saber cual formula produjo cual pocion mediante los ids
    setGrimorio((anterior) => [nuevaPocion, ...anterior]);
    setFormulas((anteriores) =>
      anteriores.map((item) =>
        item.id === formulaId
          ? { ...item, estado: "distilled", resultadoId: nuevaPocion.id }
          : item,
      ),
    );

    // Misma idea: La destilacion suma puntos y rareza  al creador de la formula. Diff: considerar que quien destila no necesariamente es quien creo la formula por lo cual no se puede usar usuarioActivo.id
    setUsuarios((anteriores) =>
      anteriores.map((usuario) =>
        usuario.id === formula.creadaPorId
          ? {
              ...usuario,
              puntos: usuario.puntos + 20,
              rarezaTotal: usuario.rarezaTotal + nuevaPocion.rareza,
            }
          : usuario,
      ),
    );

    // Si el creador es el usuario conectado tambien se le debe actualizar todo
    if (usuarioActivo?.id === formula.creadaPorId) {
      setUsuarioActivo((anterior) => ({
        ...anterior,
        puntos: anterior.puntos + 20,
        rarezaTotal: anterior.rarezaTotal + nuevaPocion.rareza,
      }));
    }

    // esta auditoria solo registra las decisiones que no se resolvieron por mayoria
    setAuditoria((anterior) => [
      {
        id: `a-${Date.now()}`,
        formulaId,
        fecha: new Date().toISOString(),
        titulo: "Poción destilada",
        detalle: `Resultado guardado: ${nuevaPocion.nombre}.`,
      },
      ...nuevaPocion.decisiones
        .filter((decision) => decision.metodo !== "mayoría simple")
        .map((decision, indice) => ({
          id: `a-${Date.now()}-${indice}`,
          formulaId,
          fecha: new Date().toISOString(),
          titulo: "Desempate resuelto",
          detalle: `${decision.opcion} gano mediante ${decision.metodo}.`,
        })),
      ...anterior,
    ]);
    mostrarAviso("La poción fue destilada y añadida al grimorio.");
  }

  // Es la función que PerfilPage.jsx obtiene de UsuarioContext.
  function guardarPerfil(datos) {
    const email = datos.email.trim().toLowerCase();

    // Permite el correo propio, pero evita usar el de otra cuenta distinta
    if (
      cuentas.some(
        (cuenta) =>
          cuenta.usuarioId !== usuarioActivo.id &&
          cuenta.email.trim().toLowerCase() === email,
      )
    ) {
      mostrarAviso("Ese correo ya esta registrado.");
      return;
    }

    // Si una prop se repite la ultima gana, por eso copiamos primero los datos viejos y luego los actualizados segun su relevancia. Primero se actualiza la sesion, luego la lista de usuarios con los datos y por ultimo el login de su cuenta.
    const actualizado = { ...usuarioActivo, ...datos, email };

    setUsuarioActivo(actualizado);

    setUsuarios((anteriores) =>
      anteriores.map((usuario) =>
        usuario.id === actualizado.id ? actualizado : usuario,
      ),
    );

    if (actualizado.email !== usuarioActivo.email) {
      // Busca la cuenta por el id del usuario y actualiza solo su correo (se usa al cambiar el perfil una vez ingresado)
      setCuentas((anteriores) =>
        anteriores.map((cuenta) =>
          cuenta.usuarioId === actualizado.id
            ? { ...cuenta, email: actualizado.email }
            : cuenta,
        ),
      );
    }

    mostrarAviso("Perfil actualizado correctamente crack.");
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
                formulas={formulas}
                gremios={gremios}
                grimorio={grimorio}
                usuarios={usuarios}
                votos={votos}
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
                formulas={formulas}
                gremios={gremiosAPI}
                onAppointTaster={nombrarCatador}
                onChangeRole={cambiarRol}
                onRemoveMember={retirarMiembro}
                usuario={usuarioActivo}
                usuarios={usuarios}
                votos={votos}
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
                votos={votos}
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
                auditoria={auditoria}
                formulas={formulasAPI}
                gremios={gremiosAPI}
                grimorio={grimorio}
                onDistill={destilarFormulaMongoDB}
                onVeto={vetarOpcion}
                onVote={votarFormula}
                onOpenVoting={abrirVotacion}
                onCloseVoting={cerrarVotacion}
                usuario={usuarioActivo}
                usuarios={usuarios}
                votos={votos}
                cargando={cargandoFormulas}
                error={errorFormulas}
              />
            }
          />
          <Route
            path="grimorio"
            element={<GrimorioPage gremios={gremios} grimorio={grimorio} />}
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
