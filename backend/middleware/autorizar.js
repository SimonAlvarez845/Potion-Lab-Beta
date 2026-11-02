// Comprueba que el usuario autenticado tenga uno de los roles permitidos.
function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
      const error = new Error(
        "No tienes permisos para realizar esta operación",
      );
      error.status = 403;
      return next(error);
    }

    next();
  };
}

module.exports = autorizar;
