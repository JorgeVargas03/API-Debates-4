const express = require("express");
const app = express();
const debRoutes = require("./routes/debRoutes"); // 👈 Verifica que esta línea importe bien el archivo
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use("/api/v1", debRoutes); // 👈 Aquí usa "pubRoutes", no un objeto
app.use("/auth", authRoutes);

//  Middleware para rutas no definidas (404 global)
app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint no encontrado. Verifica la ruta solicitada.",
    attemptedUrl: `${req.method} ${req.originalUrl}`
  });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`URL base: https://localhost:${PORT}/api/`);
});
