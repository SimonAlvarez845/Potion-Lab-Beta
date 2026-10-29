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
