const express = require("express");
const app = express();
const pubRoutes = require("./routes/pubRoutes"); // 👈 Verifica que esta línea importe bien el archivo
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use("/api", pubRoutes); // 👈 Aquí usa "pubRoutes", no un objeto
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`URL base: https://localhost:${PORT}/api/`);
});
