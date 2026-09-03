// Nos apoyamos con IA para hacer unos formatters que hicieran el display de los datos mas bonito

export function obtenerIniciales(nombre = "") {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export function formatearFecha(fecha, incluirHora = false) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(incluirHora && { hour: "numeric", minute: "2-digit" }),
  }).format(new Date(fecha));
}

export function tiempoRestante(fechaCierre) {
  const diferencia = new Date(fechaCierre).getTime() - Date.now();

  if (diferencia <= 0) return "Finalizada";

  const horas = Math.ceil(diferencia / 3_600_000);
  if (horas < 24) return `${horas} h restantes`;

  return `${Math.ceil(horas / 24)} días restantes`;
}
