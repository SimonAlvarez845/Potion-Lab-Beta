export function normalizarImagen(url) {
  if (!url) return "";

  return url.replace(/^https?:\/\/localhost:5173(?=\/demo\/)/, "");
}

export function normalizarUsuario(usuario) {
  return {
    ...usuario,
    avatarUrl: normalizarImagen(usuario.avatarUrl),
  };
}

export function normalizarGremio(gremio) {
  return {
    ...gremio,
    emblemaUrl: normalizarImagen(gremio.emblemaUrl),
  };
}
