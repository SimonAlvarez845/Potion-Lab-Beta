// Swagger UI sirve la documentación OpenAPI sin modificar los endpoints.
const swaggerUi = require("swagger-ui-express");
const especificacion = require("./openapi.json");

module.exports = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(especificacion, {
    explorer: true,
    customSiteTitle: "Potion Lab | API Docs",
    swaggerOptions: { persistAuthorization: true },
  }));
  app.get("/api/openapi.json", (req, res) => res.json(especificacion));
};
