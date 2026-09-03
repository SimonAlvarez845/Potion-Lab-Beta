import { formatearFecha } from "../../utils/formatters";

function ListaMiembros({ gremio, usuarios, puedeAdministrar, onChangeRole, onAppointTaster }) {
  return (
    <div className="lista-miembros-contenedor-alquimista-especialidad-ingreso-rol">
      <table className="lista-miembros-tabla-alquimista-especialidad-ingreso-rol">
        <thead>
          <tr className="lista-miembros-fila-tabla-alquimista-especialidad-ingreso-rol">
            <th className="lista-miembros-titulo-columna-alquimista">Nombre</th>
            <th className="lista-miembros-titulo-columna-especialidad">Especialidad</th>
            <th className="lista-miembros-titulo-columna-ingreso">Ingreso</th>
            <th className="lista-miembros-titulo-columna-rol">Rol</th>
            {puedeAdministrar && <th className="lista-miembros-titulo-columna-acciones">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {gremio.miembros.map((miembro) => {
            const usuario = usuarios.find((item) => item.id === miembro.usuarioId);
            if (!usuario) return null;

            return (
              <tr className="lista-miembros-fila-tabla-iniciales-nombre-completo-email" key={miembro.usuarioId}>
                <td className="lista-miembros-celda-iniciales-nombre-completo-email">
                  <strong className="lista-miembros-dato-destacado-nombre-completo">{usuario.nombreCompleto}</strong>
                </td>
                <td className="lista-miembros-celda-especialidad">{usuario.especialidad}</td>
                <td className="lista-miembros-celda-fecha">{formatearFecha(miembro.fechaIngreso)}</td>
                <td className="lista-miembros-celda-rol">{miembro.rol}</td>
                {puedeAdministrar && (
                  <td className="lista-miembros-celda">
                    {miembro.rol !== "Gran Maestre" && (
                      <div className="lista-miembros-contenedor-flexible-cambiar-rol-de-nombre">
                        <select
                          className="lista-miembros-selector-aprendiz-alquimista-senior"
                          onChange={(evento) => onChangeRole(miembro.usuarioId, evento.target.value)}
                          value={miembro.rol === "Catador oficial" ? "Aprendiz" : miembro.rol}
                        >
                          <option>Aprendiz</option>
                          <option>Alquimista sénior</option>
                        </select>
                        {miembro.rol !== "Catador oficial" && (
                          <button
                            className="lista-miembros-boton-nombrar-catador"
                            onClick={() => onAppointTaster(miembro.usuarioId)}
                            type="button"
                          >
                            Nombrar catador
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ListaMiembros;
