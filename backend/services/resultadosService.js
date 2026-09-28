// Reglas puras compartidas por consultas, cierre y pruebas; no acceden a MongoDB.
const ESPECIALIDAD = { ingrediente: "Herbalista", metodo: "Runista", frasco: "Catador" };

// El bono de especialidad se combina con el voto doble del cargo interno de Catador.
function obtenerPesoVoto(usuario, categoriaId, catador) {
  const especialista = usuario.especialidad === "Maestro cervecero" || usuario.especialidad === ESPECIALIDAD[categoriaId];
  return (especialista ? 1.2 : 1) * (catador ? 2 : 1);
}

// Sumamos décimas enteras para que 1.2 + 1.2 empate exactamente con 2.4.
// Los votos simulados del seed no son votos reales de la API.
function calcularResultados(categoria, votos, veto) {
  const opciones = categoria.opciones.map((opcion) => {
    const decimas = votos.filter((v) => v.categoriaId === categoria.id && v.opcionId === opcion.id)
      .reduce((total, voto) => total + Math.round(voto.peso * 10), 0);
    return { id: opcion.id, nombre: opcion.nombre, sigla: opcion.sigla, peso: opcion.peso,
      votosIniciales: 0, totalVotos: decimas / 10,
      vetada: veto?.categoriaId === categoria.id && veto?.opcionId === opcion.id };
  });
  const total = opciones.filter((o) => !o.vetada).reduce((suma, o) => suma + Math.round(o.totalVotos * 10), 0);
  return opciones.map((o) => ({ ...o,
    porcentaje: o.vetada || total === 0 ? 0 : Math.round(Math.round(o.totalVotos * 10) / total * 100) }));
}

// Catador actual -> GM actual -> azar. Sin votos también existe un empate a cero.
function calcularGanadores(formula, gremio) {
  return formula.categorias.map((categoria) => {
    const opciones = calcularResultados(categoria, formula.votos, formula.veto).filter((o) => !o.vetada);
    const maximo = Math.max(...opciones.map((o) => o.totalVotos));
    const empatadas = opciones.filter((o) => o.totalVotos === maximo);
    if (empatadas.length === 1) return { categoriaId: categoria.id, opcion: empatadas[0], metodo: "mayoría simple" };
    for (const rol of ["Catador oficial", "Gran Maestre"]) {
      const miembro = gremio.miembros.find((m) => m.rol === rol);
      const voto = formula.votos.find((v) => String(v.usuarioId) === String(miembro?.usuarioId) && v.categoriaId === categoria.id);
      const elegida = empatadas.find((o) => o.id === voto?.opcionId);
      if (elegida) return { categoriaId: categoria.id, opcion: elegida,
        metodo: rol === "Catador oficial" ? "voto del Catador Oficial" : "decisión del Gran Maestre" };
    }
    return { categoriaId: categoria.id, opcion: empatadas[Math.floor(Math.random() * empatadas.length)], metodo: "selección aleatoria" };
  });
}

module.exports = { obtenerPesoVoto, calcularResultados, calcularGanadores };
