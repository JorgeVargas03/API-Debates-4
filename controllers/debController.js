// controllers/controllerDeb.js
const debServices = require("../services/serviceDeb");

exports.getAllDebates = async (req, res) => {
  try {
    const response = await debServices.getAllDebates();

    if (response.success) {
      return res.status(200).json(response.debates);
    } else {
      return res.status(400).json({ success: false, message: response.message });
    }
  } catch (error) {
    console.error("Error al obtener debates", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

exports.addDebate = async (req, res) => {
  try {
    const username = req.username; // Obtiene el nombre del usuario desde el middleware
    const { title, argument, category } = req.body;

    // Validación: Verificar que todos los campos existan
    if (!title || !argument || !category) {
      return res.status(400).json({ message: "Argumentos no coinciden" });
    }

    const response = await debServices.createDebate(title, argument, category, username);

    if (response.success) {
      return res.status(201).json({ message: response.message, id: response.id });
    } else {
      return res.status(400).json({ message: response.message });
    }
  } catch (error) {
    console.error("Error al crear debate", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};


//● POST /debate/position/:id - Elegir si el usuario está a favor o en contra en el debate
exports.setDebatePosition = async (req, res) => {
  const { id } = req.params; // Obtiene el ID del debate desde la URL
  const { position } = req.body; // La postura (true para a favor, false para en contra)
  const username = req.username; // Obtiene el nombre del usuario desde el middleware

  if (typeof position !== "boolean") {
    return res.status(400).json({ message: "Argumentos no coinciden" }); // 400 Bad Request
  }

  try {
    const response = await debServices.setDebatePosition(id, username, position);

    if (response.message === "Posición actualizada exitosamente") {
      return res.status(200).json({ message: response.message }); // 200 OK
    } else {
      return res.status(404).json({ message: response.message }); // 404 Not found
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" }); // 500 Internal Server Error
  }
};



//● POST /debate/:id/comentario - Agregar un comentario a un debate
exports.addCommentToDebate = async (req, res) => {
  const { id } = req.params; // Obtiene el ID del debate desde la URL
  const { position, argument } = req.body; // Obtiene la postura y el argumento del cuerpo de la solicitud
  const username = req.username; // Obtiene el nombre del usuario desde el middleware

  if (typeof position !== "boolean") {
    return res.status(400).json({ message: "Argumentos no coinciden" }); // 400 Bad Request
  }

  try {
    const response = await debServices.addCommentToDebate(id, username, position, argument);

    if (response.success) {
      return res.status(200).json({ message: "La solicitud se ha completado con éxito." }); // 200 OK
    } else {
      return res.status(404).json({ message: "Debate no encontrado." }); // 404 Not found
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor." }); // 500 Internal Server Error
  }
};
