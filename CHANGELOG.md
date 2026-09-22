
# Changelog

## [2.1.0] - 2026-09-21

### Added

* Ruta 404 para páginas inexistentes.
* 45 votos demo almacenados por fórmula, usuario y categoría.
* Peso de voto persistente según especialidad y rol.
* Sistema de ranking al crear y destilar fórmulas.
* Registro de rareza acumulada al destilar.
* Protección contra destilaciones duplicadas.
* Desempate basado en votos reales de los miembros del gremio.

### Changed

* Las fechas de cierre de las fórmulas demo abiertas ahora se generan dinámicamente.
* El cálculo de resultados utiliza los votos reales de todos los usuarios.
* El Catador Oficial utiliza voto doble en todas las categorías.
* El veto excluye correctamente una opción del resultado y de sus porcentajes.
* El desempate ahora sigue el orden:

  * Catador Oficial.
  * Gran Maestre.
  * Selección aleatoria.
* Las fórmulas ya no almacenan decisiones de desempate precargadas en el seed.
* La creación de una fórmula otorga 10 puntos a su autor.
* La destilación otorga 20 puntos y suma la rareza obtenida al autor.

### Fixed

* Fórmulas demo que se cerraban inmediatamente por utilizar fechas antiguas.
* Conteos de votos que no diferenciaban usuarios ni categorías.
* Indicadores de cantidad de votos del usuario.
* Sincronización de puntos entre el ranking y la sesión activa.
* Posibilidad de obtener recompensas múltiples destilando la misma fórmula.
* Uso de datos artificiales para resolver empates.
* Persistencia y sincronización de correos de cuentas demo.
