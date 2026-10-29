import { useState } from "react";
import { formatearFecha } from "../../utils/formatters";

function ListaMiembros({
  gremio,
  usuarios,
  puedeAdministrar,
  onChangeRole,
  onAppointTaster,
  onRemoveMember,
  usuarioActualId,
}) {
  // NEWCOMMENT: Evita ejecutar dos operaciones simultáneas.
  const [procesando, setProcesando] = useState(false);

  async function ejecutarOperacion(operacion) {
    if (procesando) return;

    setProcesando(true);

    try {
      await operacion();
    } finally {
      setProcesando(false);
    }
  }

  async function manejarRetiro(usuarioId, nombre) {
    const esPropio = usuarioId === usuarioActualId;

    const confirmado = window.confirm(
      esPropio
        ? "¿Seguro que quieres abandonar este gremio?"
        : `¿Seguro que quieres expulsar a ${nombre}?`,
    );

    if (!confirmado) return;

    await ejecutarOperacion(() => onRemoveMember(usuarioId));
  }

  const puedeSalir = gremio.miembros.some(
    (miembro) =>
      miembro.usuarioId === usuarioActualId && miembro.rol !== "Gran Maestre",
  );

  return (
    <div className="lista-miembros-contenedor-alquimista-especialidad-ingreso-rol">
      <table className="lista-miembros-tabla-alquimista-especialidad-ingreso-rol">
        <thead>
          <tr className="lista-miembros-fila-tabla-alquimista-especialidad-ingreso-rol">
            <th className="lista-miembros-titulo-columna-alquimista">Nombre</th>
            <th className="lista-miembros-titulo-columna-especialidad">
              Especialidad
            </th>
            <th className="lista-miembros-titulo-columna-ingreso">Ingreso</th>
            <th className="lista-miembros-titulo-columna-rol">Rol</th>
            {(puedeAdministrar || puedeSalir) && (
              <th className="lista-miembros-titulo-columna-acciones">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {gremio.miembros.map((miembro) => {
            const usuario = usuarios.find(
              (item) => item.id === miembro.usuarioId,
            );

            if (!usuario) return null;

            const esPropio = miembro.usuarioId === usuarioActualId;
            const puedeRetirar =
              miembro.rol !== "Gran Maestre" && (esPropio || puedeAdministrar);

            return (
              <tr
                className="lista-miembros-fila-tabla-iniciales-nombre-completo-email"
                key={miembro.usuarioId}
              >
                <td className="lista-miembros-celda-iniciales-nombre-completo-email">
                  <div className="lista-miembros-contenedor-flexible-iniciales-nombre-completo-email">
                    <span
                      className="lista-miembros-insignia-iniciales imagen-con-respaldo"
                      role="img"
                      aria-label={`Perfil de ${usuario.nombreCompleto}`}
                    >
                      <span aria-hidden="true">
                        {usuario.nombreCompleto.charAt(0)}
                      </span>
                      {usuario.avatarUrl && (
                        <img
                          key={usuario.avatarUrl}
                          src={usuario.avatarUrl}
                          alt=""
                          onError={(evento) => {
                            evento.currentTarget.hidden = true;
                          }}
                        />
                      )}
                    </span>
                    <strong className="lista-miembros-dato-destacado-nombre-completo">
                      {usuario.nombreCompleto}
                    </strong>
                  </div>
                </td>

                <td className="lista-miembros-celda-especialidad">
                  {usuario.especialidad}
                </td>

                <td className="lista-miembros-celda-fecha">
                  {formatearFecha(miembro.fechaIngreso)}
                </td>

                <td className="lista-miembros-celda-rol">{miembro.rol}</td>

                {(puedeAdministrar || puedeSalir) && (
                  <td className="lista-miembros-celda">
                    {puedeAdministrar && miembro.rol !== "Gran Maestre" && (
                      <div className="lista-miembros-contenedor-flexible-cambiar-rol-de-nombre">
                        <select
                          className="lista-miembros-selector-aprendiz-alquimista-senior"
                          disabled={procesando}
                          onChange={(evento) =>
                            ejecutarOperacion(() =>
                              onChangeRole(
                                miembro.usuarioId,
                                evento.target.value,
                              ),
                            )
                          }
                          value={
                            miembro.rol === "Catador oficial"
                              ? "Aprendiz"
                              : miembro.rol
                          }
                        >
                          <option>Aprendiz</option>
                          <option>Alquimista sénior</option>
                        </select>

                        {miembro.rol !== "Catador oficial" && (
                          <button
                            className="lista-miembros-boton-nombrar-catador"
                            disabled={procesando}
                            onClick={() =>
                              ejecutarOperacion(() =>
                                onAppointTaster(miembro.usuarioId),
                              )
                            }
                            type="button"
                          >
                            Nombrar catador
                          </button>
                        )}
                      </div>
                    )}

                    {puedeRetirar && (
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() =>
                          manejarRetiro(
                            miembro.usuarioId,
                            usuario.nombreCompleto,
                          )
                        }
                      >
                        {esPropio ? "Abandonar gremio" : "Expulsar"}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {procesando && <p role="status">Guardando cambios...</p>}
    </div>
  );
}

export default ListaMiembros;
