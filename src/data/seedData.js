// Constantes y utilidades del dominio utilizadas por el Frontend.
// Los usuarios, gremios, formulas y votos se obtienen del Backend.

export const ESPECIALIDADES = [
  "Herbalista",
  "Runista",
  "Catador",
  "Maestro cervecero",
];

export const ESTADOS_FORMULA = {
  proposal: { etiqueta: "Propuesta", tono: "slate" },
  voting: { etiqueta: "Votación Abierta", tono: "cyan" },
  closed: { etiqueta: "Cerrada", tono: "amber" },
  distilled: { etiqueta: "Destilada", tono: "violet" },
};

// Cuentas publicas de demostración para el acceso rápido.
// Note: Las contraseñas deben coincidir con las configuradas en MongoDB.
export const CUENTAS_ACCESO = [
  {
    email: "simon@potionlab.edu",
    password: import.meta.env.VITE_DEMO_PASSWORD_SIMON || "potion123",
    etiqueta: "Grand Master",
  },
  {
    email: "debotero@eia.edu",
    password: import.meta.env.VITE_DEMO_PASSWORD_DAVID || "catador123",
    etiqueta: "Catador Oficial",
  },
];
