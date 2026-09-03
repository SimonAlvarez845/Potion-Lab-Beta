import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Acceso from "./components/authentication/Acceso";
import Aviso from "./components/common/Aviso";
import LayoutPrincipal from "./components/layout/LayoutPrincipal";
import UsuarioContext from "./context/UsuarioContext";
import {
  AUDITORIA_INICIAL,
  CUENTAS_DEMO,
  FORMULAS_INICIALES,
  GREMIOS_INICIALES,
  GRIMORIO_INICIAL,
  USUARIOS_DEMO,
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
import { crearPocionDesdeFormula, TRANSICIONES_VALIDAS } from "./utils/formula";
import { esCatadorOficial, obtenerRol, puedeCrearFormula } from "./utils/roles";

// App es el padre central. Sus responsabilidades son las siguientes:
// Mantiene el estado usando un custom hook con LocalStorage
// Controla la sesion del usuario y configura las rutas con React Router
// Contiene la logica del negocio y las operaciones principales (crear gremios, formulas, votar,etc)

function App() {
  // Obtenemos todos los estados guardados en local storage
  const [usuarios, setUsuarios] = useLocalStorage(
    "potionlab-v2-usuarios",
    USUARIOS_DEMO,
  );
  const [cuentas, setCuentas] = useLocalStorage(
    "potionlab-v2-cuentas",
    CUENTAS_DEMO,
  );
  const [usuarioActivo, setUsuarioActivo] = useLocalStorage(
    "potionlab-v2-sesion",
    null,
  );
  const [gremios, setGremios] = useLocalStorage(
    "potionlab-v2-gremios",
    GREMIOS_INICIALES,
  );
  const [formulas, setFormulas] = useLocalStorage(
    "potionlab-v2-formulas",
    FORMULAS_INICIALES,
  );
  const [votos, setVotos] = useLocalStorage("potionlab-v2-votos", {}); // es un objeto debe empezar vacio
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
    // nos apoyamos de el some() - que pregunta si existe al menos un elemento que cumpla la condicion
    setFormulas((anteriores) =>
      anteriores.map((formula) => {
        const estaVencida = vencidas.some(
          (vencida) => vencida.id === formula.id,
        );
        return estaVencida ? { ...formula, estado: "closed" } : formula;
      }),
    );
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

  //-------------------------------------------------------------------------------------------------
  // Toda funcion de App suele seguir el mismo flujo:
  // Busqueda -> Validacion -> Actualizacion Estado -> Guardado en localStorage
  // el ultimo paso en caso de que aplique seria hacer la auditoria

  // Para actualizar arrays se repiten tres patrones:
  // agregar    -> spread (...)
  // modificar  -> map()
  // eliminar   -> filter()

  // Si el dato esta anidado, se combinan map() y spread para copiar
  // cada nivel sin modificar directamente el estado anterior

  // todo setter viene de useLocalStorage asi que al actualizar el
  // estado los datos tambien quedan almacenados en el mismo navegador
  // -------------------------------------------------------------------------------------------------

  // es la funcion que Acceso.jsx recibe como onLogin
  function iniciarSesion(email, password) {
    const cuenta = cuentas.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );

    // Son los mensajes de validaciones de auth, si no encuentraada nada el setter se encarga de que estos mensajes aparezcan en pantalla
    if (!cuenta) {
      return { ok: false, mensaje: "El correo o la contraseña no coinciden." };
    }

    const usuario = usuarios.find((item) => item.id === cuenta.usuarioId);

    // "Si falta el perfil (nos protege aun mas asegurando que exista ese id)
    if (!usuario) {
      return { ok: false, mensaje: "No encontramos el perfil asociado." };
    }

    setUsuarioActivo(usuario);
    return { ok: true };
  }

  // Es la funcion que Acceso recibe como onRegister
  function registrarUsuario(datos) {
    const id = `u-${Date.now()}`; // lo buscamos: forma practica de generar un ID casi unico

    // Agrega stats iniciales y toma los datos de los inputs del form
    const nuevoUsuario = {
      id,
      nombreCompleto: datos.nombreCompleto.trim(),
      email: datos.email.trim().toLowerCase(),
      especialidad: datos.especialidad,
      avatarUrl: datos.avatarUrl.trim(),
      puntos: 0,
      rarezaTotal: 0,
      precisionCatador: 0,
      participacion: 100,
    };

    // Se agregan a usuarios y les crea su cuenta
    setUsuarios((anteriores) => [...anteriores, nuevoUsuario]);
    setCuentas((anteriores) => [
      ...anteriores,
      {
        email: nuevoUsuario.email,
        password: datos.password,
        usuarioId: id,
        etiqueta: "Perfil nuevo",
      },
    ]);

    // Un plus: inicio de sesion automatico tras registro
    setUsuarioActivo(nuevoUsuario);
  }

  // Para decidir que interfaz mostrar cuando el usuario se salga
  function cerrarSesion() {
    setUsuarioActivo(null);
  }

  // Es la funcion que GremiosPage.jsx recibe como OnCreateGuild
  function crearGremio(datos) {
    // si existe un nombre disponible para el gremio, lo crea
    if (
      gremios.some(
        (gremio) =>
          gremio.nombre.toLowerCase() === datos.nombre.trim().toLowerCase(),
      )
    ) {
      return { ok: false, mensaje: "Ya existe un gremio con ese nombre." };
    }

    const acentos = ["#9b87f5", "#55d9e8", "#f4c96b", "#6ee7b7"];
    const id = `g-${Date.now()}`;
    // buscamos como se hacia en los juegos: lo genera aleatoriariamente y debe ser de 6 caracteres.
    const codigo = Math.random().toString(36).slice(2, 8).toUpperCase();
    const nuevoGremio = {
      id,
      nombre: datos.nombre.trim(),
      lema: datos.lema.trim(),
      descripcion: datos.descripcion.trim(),
      tipo: datos.tipo,
      emblemaUrl: datos.emblemaUrl.trim(),
      codigoInvitacion: codigo,
      acento: acentos[gremios.length % acentos.length],
      // para que vaya rotando entre los distintos colores
      miembros: [
        {
          usuarioId: usuarioActivo.id,
          rol: "Gran Maestre",
          fechaIngreso: new Date().toISOString(), // convierte el date a texto
        },
      ],
    };

    // Le agregamos el estado al final y lo guardamos en LocalStorage
    setGremios((anteriores) => [...anteriores, nuevoGremio]);

    mostrarAviso(
      datos.tipo === "privado"
        ? `Gremio creado. Código de invitación: ${codigo}`
        : "El nuevo gremio fue creado correctamente.",
    );
    return { ok: true, gremioId: id };
  }

  // necesita saber a que gremio quiero entrar y su codigo (si es publico lo tomamos como vacio)
  function unirseAGremio(gremioId, codigo) {
    const gremio = gremios.find((item) => item.id === gremioId);

    // Validaciones
    if (!gremio) return { ok: false, mensaje: "El gremio no existe." };

    if (
      gremio.miembros.some((miembro) => miembro.usuarioId === usuarioActivo.id)
    ) {
      return { ok: false, mensaje: "Ya perteneces a este gremio." };
    }

    // Solo validamos el codigo si el gremio es privado para verificar si el codigo es correcto
    if (
      gremio.tipo === "privado" &&
      gremio.codigoInvitacion !== codigo.trim().toUpperCase()
    ) {
      return { ok: false, mensaje: "El código de invitación no es válido." };
    }

    // Ahora si en caso de que pueda entrar debemos modificar la lista de miembros y esa persona entra por defecto como aprendiz
    setGremios((anteriores) =>
      anteriores.map((item) =>
        item.id === gremioId
          ? {
              ...item,
              miembros: [
                ...item.miembros,
                {
                  usuarioId: usuarioActivo.id,
                  rol: "Aprendiz",
                  fechaIngreso: new Date().toISOString(),
                },
              ],
            }
          : item,
      ),
    );
    mostrarAviso(`Ahora perteneces a ${gremio.nombre}.`);
    return { ok: true };
  }

  // Asciende un usuario dentro de un gremio a "moderador"
  function cambiarRol(gremioId, usuarioId, nuevoRol) {
    const gremio = gremios.find((item) => item.id === gremioId);

    // Contamos el # de Alquimistas Séniors sin incluir al usuario seleccionado
    const cantidadSenior = gremio.miembros.filter(
      (miembro) =>
        miembro.rol === "Alquimista sénior" && miembro.usuarioId !== usuarioId,
    ).length;

    // Validacion del enunciado
    // 1) Senior Alchemist --> max 3.
    if (nuevoRol === "Alquimista sénior" && cantidadSenior >= 3) {
      mostrarAviso(
        "El gremio ya alcanzó el máximo de tres Alquimistas sénior.",
      );

      return;
    }

    setGremios((anteriores) =>
      anteriores.map((item) =>
        item.id === gremioId
          ? {
              ...item,
              miembros: item.miembros.map((miembro) =>
                miembro.usuarioId === usuarioId
                  ? { ...miembro, rol: nuevoRol }
                  : miembro,
              ),
            }
          : item,
      ),
    );
    mostrarAviso(`Rol actualizado a ${nuevoRol}.`);
  }

  // Asciende un unico usuario por gremio a "special" (realmente a veces manipula dos usuarios)
  function nombrarCatador(gremioId, usuarioId) {
    setGremios((anteriores) =>
      anteriores.map((gremio) =>
        gremio.id === gremioId
          ? // crea una copia modificada en donde recorre los miembros y separa en tres casos:
            // si el usuario es elegido se le da el rol, si ya habia otro catador (los cambia modificando ambos), si esta persona fue elegida ni es el catador no hagas nada
            {
              ...gremio,
              miembros: gremio.miembros.map((miembro) => {
                if (miembro.usuarioId === usuarioId) {
                  return { ...miembro, rol: "Catador oficial" };
                }
                if (miembro.rol === "Catador oficial") {
                  return { ...miembro, rol: "Aprendiz" };
                }
                return miembro;
              }),
            }
          : gremio,
      ),
    );
    mostrarAviso("Un nuevo Catador Oficial fue nombrado.");
  }

  // los datos vienen del form de creacion de formula
  // Es la funcion que NuevaFormulaPage.jsx recibe como OnCreateFormula
  function crearFormula(datos) {
    const gremio = gremios.find((item) => item.id === datos.gremioId);

    // Validacion
    if (!gremio || !puedeCrearFormula(gremio, usuarioActivo)) {
      return {
        ok: false,
        mensaje:
          "Tu rol o nivel de participación no permiten crear esta fórmula.",
      };
    }

    // Creacion del objeto
    const id = `f-${Date.now()}`;
    const nuevaFormula = {
      id,
      gremioId: datos.gremioId,
      nombrePocion: datos.nombrePocion.trim(),
      efectoDeseado: datos.efectoDeseado.trim(),
      dificultad: datos.dificultad,
      estado: "proposal",
      creadaPorId: usuarioActivo.id,
      fechaCreacion: new Date().toISOString(),
      fechaCierre: datos.fechaCierre,
      categorias: datos.categorias,
      desempate: {}, // se usa despues si lo hay
      veto: null, // nadie ha usado el veto todavia
    };

    // Agregacion del estado (al principio) y lo guardamos en LocalStorage
    setFormulas((anteriores) => [nuevaFormula, ...anteriores]);
    setAuditoria((anterior) => [
      {
        id: `a-${Date.now()}`,
        formulaId: id,
        fecha: new Date().toISOString(),
        titulo: "Propuesta creada",
        detalle: `${usuarioActivo.nombreCompleto} registró la fórmula base.`,
      },
      ...anterior,
    ]);
    mostrarAviso("La fórmula fue guardada como propuesta.");
    return { ok: true, formulaId: id };
  }

  // Es la funcion que FormulaDetallePage.jsx recibe como onVote
  function votar(formulaId, categoriaId, opcionId) {
    // Busca formula, si existe busca gremio, si existe busca si usuario pertenece a gremio
    const formula = formulas.find((item) => item.id === formulaId);
    const gremio = gremios.find((item) => item.id === formula?.gremioId);
    const esMiembro = gremio?.miembros.some(
      (miembro) => miembro.usuarioId === usuarioActivo.id,
    );

    //  Validacion
    if (formula?.estado !== "voting" || !esMiembro) return;

    // Actualizamos su estado, misma logica que forms pero con una capa adicional porque votos es un objeto que puede cambiar tanto su formula como su categoria
    setVotos((anteriores) => ({
      ...anteriores,
      [formulaId]: {
        ...anteriores[formulaId],
        [categoriaId]: opcionId,
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

    if (
      !formula ||
      formula.estado !== "voting" ||
      formula.veto ||
      !esCatadorOficial(gremio, usuarioActivo.id)
    ) {
      return;
    }

    // La añade al principio al igual que el log
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

  // Es la función que FormulaDetallePage.jsx recibe como onTransition.
  function cambiarEstado(formulaId, nuevoEstado) {
    // Busca la formula
    const formula = formulas.find((item) => item.id === formulaId);

    // Busca el gremio de esa formula
    const gremio = gremios.find((item) => item.id === formula?.gremioId);

    // Busca el rol del usuario en ese gremio
    const rol = obtenerRol(gremio, usuarioActivo.id);

    // Validacion (tenga en cuenta el ciclo y sus transiciones:
    // proposal --> voting ---> closed ---> distilled)
    // no puedo pasar de proposal a closed sin haber votado
    // y que solo dos roles pueden cambiar el estado
    if (
      !formula ||
      TRANSICIONES_VALIDAS[formula.estado] !== nuevoEstado ||
      !["Gran Maestre", "Alquimista sénior"].includes(rol)
    ) {
      return;
    }

    // Actualizacion del estado de estado
    setFormulas((anteriores) =>
      anteriores.map((item) =>
        item.id === formulaId ? { ...item, estado: nuevoEstado } : item,
      ),
    );
    // siempre hay que indicarle al usuario
    const titulo =
      nuevoEstado === "voting" ? "Votación abierta" : "Votación cerrada";
    setAuditoria((anterior) => [
      {
        id: `a-${Date.now()}`,
        formulaId,
        fecha: new Date().toISOString(),
        titulo,
        detalle: `${usuarioActivo.nombreCompleto} cambio el estado de la fórmula.`,
      },
      ...anterior,
    ]);
    mostrarAviso(titulo);
  }

  // Es la función que FormulaDetallePage.jsx recibe como onDistill.
  // Su deber es convertir una fórmula cerrada en una pocion y guardarla en el grimorio.
  function destilarFormula(formulaId) {
    const formula = formulas.find((item) => item.id === formulaId);
    const gremio = gremios.find((item) => item.id === formula?.gremioId);
    const rol = obtenerRol(gremio, usuarioActivo.id);

    if (
      !formula ||
      formula.estado !== "closed" ||
      !["Gran Maestre", "Alquimista sénior"].includes(rol)
    ) {
      return;
    }

    // Se pasa el objeto entero de la formula
    const nuevaPocion = crearPocionDesdeFormula(
      formula,
      votos[formulaId] ?? {}, // Si no existen votos para una formula, usa un objeto vacio.
      usuarioActivo,
      esCatadorOficial(gremio, usuarioActivo.id), // un booleano
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

    // EXPLICAR ESTO SI HAY TIEMPO
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
          detalle: `${decision.opcion} ganó mediante ${decision.metodo}.`,
        })),
      ...anterior,
    ]);
    mostrarAviso("La poción fue destilada y añadida al grimorio.");
  }

  // Es la función que PerfilPage.jsx recibe como onSaveProfile.
  function guardarPerfil(datos) {
    // El orden aqui es clave, si una propiedad se repite, la última gana, por eso copiamos primero los datos viejos y luego los actualizados. Esto es lo que hacen las paginas para que un usuario pueda actualizar su perfil si su sesion esta activa
    const actualizado = { ...usuarioActivo, ...datos };

    setUsuarioActivo(actualizado);

    setUsuarios((anteriores) =>
      anteriores.map((usuario) =>
        usuario.id === actualizado.id ? actualizado : usuario,
      ),
    );
    mostrarAviso("Perfil actualizado correctamente crack.");
  }

  // Si el usuario es null entonces no esta activo y app solo devuelve <Acceso/>, de lo contrario si debe aparecer toda la App
  if (!usuarioActivo) {
    return <Acceso onLogin={iniciarSesion} onRegister={registrarUsuario} />;
  }

  // Uso del Context:
  // Implica que unicamente los componentes que consuman UsuarioContext podran acceder a usuarioActivo
  return (
    <UsuarioContext.Provider value={usuarioActivo}>
      <Routes>
        {/* LayoutPrincipal es el Home Page de la pagina y por ende todos sus hijos lo comparten */}
        <Route element={<LayoutPrincipal onLogout={cerrarSesion} />}>
          <Route
            index
            element={
              <ResumenPage
                formulas={formulas}
                gremios={gremios}
                grimorio={grimorio}
                usuario={usuarioActivo}
                usuarios={usuarios}
                votos={votos}
              />
            }
          />
          <Route
            path="gremios"
            element={
              <GremiosPage
                gremios={gremios}
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
                gremios={gremios}
                onAppointTaster={nombrarCatador}
                onChangeRole={cambiarRol}
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
                formulas={formulas}
                gremios={gremios}
                usuarios={usuarios}
                votos={votos}
              />
            }
          />
          <Route
            path="formulas/nueva"
            element={
              <NuevaFormulaPage
                gremios={gremios}
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
                formulas={formulas}
                gremios={gremios}
                grimorio={grimorio}
                onDistill={destilarFormula}
                onTransition={cambiarEstado}
                onVeto={vetarOpcion}
                onVote={votar}
                usuario={usuarioActivo}
                usuarios={usuarios}
                votos={votos}
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
          <Route
            path="perfil"
            element={
              <PerfilPage
                onSaveProfile={guardarPerfil}
                usuario={usuarioActivo}
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
