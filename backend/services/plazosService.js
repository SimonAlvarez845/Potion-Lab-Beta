const Formula = require("../models/formula");
const Gremio = require("../models/gremio");
const { calcularGanadores } = require("./resultadosService");
const { aplicarDestilacion } = require("./destilacionService");
const { actualizarSanciones } = require("./estadisticasService");

// Guarda la revisión en curso para evitar ejecutar varias al mismo tiempo.
let actualizacion;

// Retira el cargo al Catador si tiene una sancion pendiente.
async function aplicarSancionCatador(formula) {
  if (!formula.sancionCatadorPendiente) return;

  // Buscamos al Catador en su gremio y comprobamos que siga teniendo el mismo nombramiento.
  // Esto evita sancionar al usuario si fue nombrado nuevamente después.
  await Gremio.updateOne(
    {
      _id: formula.gremioId,
      miembros: {
        $elemMatch: {
          usuarioId: formula.catadorId,
          rol: "Catador oficial",
          fechaNombramientoCatador: formula.fechaNombramientoCatador ?? null,
        },
      },
    },
    // Cambiamos su rol a Aprendiz y aumentamos la versión del documento.
    { $set: { "miembros.$.rol": "Aprendiz" }, $inc: { __v: 1 } },
  );

  // Marcamos la sanción como procesada para no repetirla.
  formula.sancionCatadorPendiente = false;
  await formula.save();
}

// Revisa las fórmulas pendientes para cerrar votaciones, destilar y aplicar sanciones.
async function procesarPlazos() {
  const ahora = new Date();

  // Buscamos las fórmulas que están en votación, cerradas o con sanciones pendientes.
  // $or permite que se cumpla cualquiera de las tres condiciones.
  // sort las ordena por fecha de cierre, en orden ascendente
  const formulas = await Formula.find({
    $or: [
      { estado: "voting" },
      { estado: "closed" },
      { sancionCatadorPendiente: true },
    ],
  }).sort({ fechaCierre: 1 });

  // Recorremos cada fórmula para comprobar si hay algo pendiente.
  for (const formula of formulas) {
    try {
      await aplicarSancionCatador(formula);

      let gremio = await Gremio.findById(formula.gremioId);
      if (!gremio)
        throw new Error("No existe el gremio de una fórmula pendiente");

      // Bandera para saber si debemos guardar cambios en la fórmula.
      let modificada = false;

      // Buscamos al Catador actual y comprobamos si coincide con el registrado en la fórmula. También comparamos la fecha para distinguir nombramientos diferentes del mismo usuario.
      const catadorActual = gremio.miembros.find(
        (m) => m.rol === "Catador oficial",
      );
      const mismoCatador =
        catadorActual &&
        String(formula.catadorId) === String(catadorActual.usuarioId) &&
        formula.fechaNombramientoCatador?.getTime() ===
          catadorActual.fechaNombramientoCatador?.getTime();

      // Si el Catador cambió mientras la votación sigue abierta, actualizamos sus datos.
      if (formula.estado === "voting" && catadorActual && !mismoCatador) {
        formula.catadorId = catadorActual.usuarioId;
        formula.fechaNombramientoCatador =
          catadorActual.fechaNombramientoCatador;

        // El plazo empieza desde la apertura de la votación o desde el nombramiento,
        // dependiendo de cuál de las dos fechas sea más reciente.
        formula.fechaInicioCatador = new Date(
          Math.max(
            formula.fechaAperturaVotacion.getTime(),
            catadorActual.fechaNombramientoCatador?.getTime() || 0,
          ),
        );

        // El nuevo Catador todavía debe ser evaluado.
        formula.catadorEvaluado = false;
        modificada = true;
      }

      // Solo evaluamos al Catador si todavía no fue evaluado y hay uno registrado.
      if (!formula.catadorEvaluado && formula.catadorId) {
        const inicio =
          formula.fechaInicioCatador || formula.fechaAperturaVotacion;

        // Convertimos 48 horas a milisegundos y calculamos el límite para votar.
        const limite = new Date(inicio.getTime() + 48 * 60 * 60 * 1000);
        const fin = formula.fechaCierreEfectivo || formula.fechaCierre;

        // Evaluamos cuando pasan las 48 horas o si la votación termina antes.
        if (ahora >= limite || fin < limite) {
          // some devuelve true si encuentra al menos un voto del Catador dentro del plazo.
          // Usamos la fecha del primer voto para conservarla aunque cambie su elección.
          const voto = formula.votos.some(
            (v) =>
              String(v.usuarioId) === String(formula.catadorId) &&
              (v.fechaPrimerVoto || v.fecha) <= limite,
          );

          // Verificamos que el Catador todavía tenga su cargo.
          const catador = gremio.miembros.find(
            (m) =>
              String(m.usuarioId) === String(formula.catadorId) &&
              m.rol === "Catador oficial",
          );

          // También comprobamos que siga siendo el mismo nombramiento.
          const mismoNombramiento =
            catador &&
            catador.fechaNombramientoCatador?.getTime() ===
              formula.fechaNombramientoCatador?.getTime();

          formula.catadorEvaluado = true;
          modificada = true;

          // Sancionamos si pasaron las 48 horas, la votación seguía abierta
          // durante ese plazo, no votó y todavía conserva el mismo nombramiento.
          if (ahora >= limite && fin >= limite && !voto && mismoNombramiento) {
            formula.sancionCatadorPendiente = true;

            // Registramos la sanción en el historial de la fórmula.
            formula.auditoria.push({
              fecha: limite,
              titulo: "Catador sancionado",
              detalle:
                "Perdió el cargo por no votar durante sus primeras 48 horas.",
              usuarioId: formula.catadorId,
            });
          }
        }
      }

      // Si cambiamos datos del Catador, guardamos la fórmula.
      if (modificada) {
        await formula.save();

        // Aplicamos la sanción pendiente si corresponde y volvemos a consultar el gremio.
        await aplicarSancionCatador(formula);
        gremio = await Gremio.findById(formula.gremioId);
      }

      // Cerramos automáticamente una votación cuando llega su fecha límite.
      if (formula.estado === "voting" && formula.fechaCierre <= ahora) {
        formula.ganadores = calcularGanadores(formula, gremio);
        formula.estado = "closed";
        formula.fechaCierreEfectivo = formula.fechaCierre;

        // Dejamos registrado el cierre automático en la auditoría.
        formula.auditoria.push({
          fecha: formula.fechaCierre,
          titulo: "Cierre automático",
          detalle:
            "La votación llegó a su fecha límite y se guardaron los ganadores.",
        });
      }

      // Las fórmulas cerradas se convierten en pociones destiladas.
      if (formula.estado === "closed") {
        // Si todavía no tiene ganadores, los calculamos antes de destilar.
        if (formula.ganadores.length === 0) {
          formula.ganadores = calcularGanadores(formula, gremio);
        }

        aplicarDestilacion(formula);
        await formula.save();
      }
    } catch (error) {
      // Si otra petición guardó primero, dejamos que la próxima revisión
      // vuelva a leer la fórmula. Los demás errores sí se propagan.
      if (error.name !== "VersionError") throw error;
    }
  }

  // Revisamos las sanciones generales por baja participación.
  await actualizarSanciones();
}

// Evitamos ejecutar dos revisiones de plazos al mismo tiempo.
// Si ya existe una revisión, las siguientes llamadas esperan la misma promesa.
function actualizarPlazos() {
  if (!actualizacion) {
    actualizacion = procesarPlazos().finally(() => {
      actualizacion = null;
    });
  }

  return actualizacion;
}

// Iniciamos una revisión automática cada segundo.
function iniciarPlazos() {
  const reloj = setInterval(() => {
    actualizarPlazos().catch((error) => {
      console.error("No se pudieron actualizar los plazos:", error.name);
    });
  }, 1000);

  // Permite que este temporizador no impida que Node termine el proceso.
  reloj.unref();
}

module.exports = { actualizarPlazos, iniciarPlazos };
