const Formula = require("../models/formula");
const Gremio = require("../models/gremio");
const Usuario = require("../models/usuario");

// Participar significa votar en cada categoría disponible, sin contar el peso.
function calcularParticipacion(formulas, usuarioId) {
  let emitidos = 0;
  let posibles = 0;

  // Recorremos las fórmulas y contamos las categorías disponibles y los votos del usuario.
  for (const formula of formulas) {
    posibles += formula.categorias.length;
    emitidos += formula.votos.filter(
      (v) => String(v.usuarioId) === String(usuarioId),
    ).length;
  }

  // Calculamos el porcentaje. Si no podía votar en ninguna categoría, dejamos 100%.
  return posibles === 0 ? 100 : (emitidos / posibles) * 100;
}

// Filtramos las fórmulas en las que el usuario tenía derecho a participar.
function formulasParticipables(formulas, usuarioId, fechaIngreso) {
  return formulas.filter((f) => {
    // Solo contamos las votaciones que ya terminaron.
    if (!["closed", "distilled"].includes(f.estado)) return false;

    // Si tenemos los participantes registrados, buscamos al usuario en esa lista.
    // some devuelve true cuando encuentra al menos una coincidencia.
    if (f.participantes.length > 0) {
      return f.participantes.some((id) => String(id) === String(usuarioId));
    }

    // Para fórmulas antiguas comprobamos si la votación abrió después de su ingreso.
    return f.fechaAperturaVotacion && f.fechaAperturaVotacion >= fechaIngreso;
  });
}

// Calculamos los puntos, rareza, participación y precisión de los usuarios.
async function obtenerEstadisticas(gremioId) {
  // Si recibimos un gremioId, consultamos solo ese gremio. Si no, consultamos todos.
  const consulta = gremioId ? { gremioId } : {};
  const formulas = await Formula.find(consulta).sort({
    fechaCierreEfectivo: -1,
    _id: -1,
  });
  const gremios = await Gremio.find(gremioId ? { _id: gremioId } : {});

  // Guardamos las estadísticas usando el ID de cada usuario como clave.
  const estadisticas = {};

  // Esta función crea los contadores del usuario si todavía no existen.
  function datos(id) {
    const clave = String(id);

    if (!estadisticas[clave]) {
      estadisticas[clave] = {
        puntos: 0,
        rarezaTotal: 0,
        participacion: 100,
        precisionCatador: 0,
        aciertos: 0,
        votosCatador: 0,
        votosEmitidos: 0,
        votosPosibles: 0,
      };
    }

    return estadisticas[clave];
  }

  // Recorremos las fórmulas para calcular los puntos del autor y los aciertos del Catador.
  for (const formula of formulas) {
    const autor = datos(formula.creadaPorId);

    // Crear una fórmula da 10 puntos.
    autor.puntos += 10;

    // Si la fórmula fue destilada, damos otros 20 puntos y sumamos su rareza.
    if (formula.estado === "distilled" && formula.pocion) {
      autor.puntos += 20;
      autor.rarezaTotal += formula.pocion.rareza;
    }

    // Solo podemos comparar votos con ganadores cuando la votación terminó.
    if (!["closed", "distilled"].includes(formula.estado)) continue;

    for (const voto of formula.votos) {
      // El peso doble identifica los votos del Catador guardados antes de esta fase.
      const esCatador =
        voto.esCatador === true ||
        (voto.esCatador === undefined && voto.peso >= 2);

      // Ignoramos los votos de usuarios que no eran Catadores.
      if (!esCatador) continue;

      const catador = datos(voto.usuarioId);

      // Buscamos el ganador de la misma categoría en la que votó el Catador.
      const ganador = formula.ganadores.find(
        (g) => g.categoriaId === voto.categoriaId,
      );

      // Contamos cada voto del Catador para calcular después su precisión.
      catador.votosCatador += 1;

      // Si eligió la opción ganadora, sumamos un acierto.
      if (ganador?.opcion.id === voto.opcionId) catador.aciertos += 1;
    }
  }

  // Calculamos la participación de los miembros de cada gremio.
  for (const gremio of gremios) {
    // Nos quedamos con las fórmulas que pertenecen a este gremio.
    const propias = formulas.filter(
      (f) => String(f.gremioId) === String(gremio._id),
    );

    for (const miembro of gremio.miembros) {
      const usuario = datos(miembro.usuarioId);

      // Buscamos las últimas cinco fórmulas donde podía votar.
      // slice(0, 5) toma las primeras cinco, ya ordenadas desde la más reciente.
      const ultimas = formulasParticipables(
        propias,
        miembro.usuarioId,
        miembro.fechaIngreso,
      ).slice(0, 5);

      for (const formula of ultimas) {
        // Cada categoría representa una oportunidad de votar.
        usuario.votosPosibles += formula.categorias.length;

        // Contamos cuántos votos registró el miembro en esa fórmula.
        usuario.votosEmitidos += formula.votos.filter(
          (v) => String(v.usuarioId) === String(miembro.usuarioId),
        ).length;
      }
    }
  }

  // Convertimos los contadores anteriores en porcentajes.
  for (const usuario of Object.values(estadisticas)) {
    // Participación = votos emitidos / votos posibles * 100.
    // Si todavía no tenía oportunidades de votar, su participación queda en 100%.
    usuario.participacion =
      usuario.votosPosibles === 0
        ? 100
        : (usuario.votosEmitidos / usuario.votosPosibles) * 100;

    // Precisión = aciertos / votos del Catador * 100.
    // Si no tiene votos como Catador, su precisión queda en 0%.
    usuario.precisionCatador =
      usuario.votosCatador === 0
        ? 0
        : (usuario.aciertos / usuario.votosCatador) * 100;
  }

  return estadisticas;
}

// La sanción parte del cierre de la quinta fórmula; releerla no renueva el plazo.
async function actualizarSanciones(gremioId) {
  // Podemos revisar un gremio específico o todos los gremios.
  const gremios = await Gremio.find(gremioId ? { _id: gremioId } : {});

  for (const gremio of gremios) {
    // Buscamos las fórmulas terminadas, ordenadas desde el cierre más reciente.
    // $in permite consultar los dos estados que nos interesan.
    const formulas = await Formula.find({
      gremioId: gremio._id,
      estado: { $in: ["closed", "distilled"] },
    }).sort({ fechaCierreEfectivo: -1, _id: -1 });

    // Set evita repetir IDs de usuarios.
    // Incluimos los miembros actuales y los participantes de fórmulas anteriores.
    const usuarios = new Set(gremio.miembros.map((m) => String(m.usuarioId)));

    for (const formula of formulas) {
      for (const id of formula.participantes) usuarios.add(String(id));
    }

    // Revisamos la participación de cada usuario identificado.
    for (const usuarioId of usuarios) {
      // Buscamos su membresía actual para obtener la fecha de ingreso.
      const miembro = gremio.miembros.find(
        (m) => String(m.usuarioId) === usuarioId,
      );

      // Tomamos únicamente las fórmulas en las que podía participar.
      const propias = formulasParticipables(
        formulas,
        usuarioId,
        miembro?.fechaIngreso,
      );

      // Recorremos grupos consecutivos de cinco fórmulas.
      // inicio + 5 <= propias.length evita tomar grupos incompletos.
      for (let inicio = 0; inicio + 5 <= propias.length; inicio += 1) {
        const ultimas = propias.slice(inicio, inicio + 5);

        // Si participó al menos en el 30%, no recibe sanción por este grupo.
        if (calcularParticipacion(ultimas, usuarioId) >= 30) continue;

        // Tomamos el cierre más reciente del grupo como referencia.
        const cierre = ultimas[0].fechaCierreEfectivo;

        // Si no hay una fecha de cierre, no podemos calcular la sanción.
        if (!cierre) continue;

        // Calculamos los siete días de restricción en milisegundos.
        const hasta = new Date(cierre.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Guardamos la fecha de restricción en el usuario.
        // $max evita reemplazar una sanción por otra que termine antes.
        await Usuario.updateOne(
          { _id: usuarioId },
          { $max: { restriccionFormulasHasta: hasta } },
        );

        // Terminamos la revisión de grupos para este usuario.
        break;
      }
    }
  }
}

// Exportamos las funciones que utilizan los demás servicios.
module.exports = { obtenerEstadisticas, actualizarSanciones };
