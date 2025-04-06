// controllers/controllerDeb.js
const debServices = require("../services/serviceDeb");

exports.getAllDebates = async (req, res) => {
  try {
    const { category, user } = req.query;
    const authUser = req.username; // desde el JWT extraído en el middleware

    let result;

    if (category) {
      result = await debServices.getDebatesByCategory(category);
    } else if (user) {
      if (!authUser || user.toLowerCase() !== authUser.toLowerCase()) {
        return res.status(401).json({ success: false, message: "No autorizado" });
      }
      result = await debServices.getDebatesByUser(authUser);
    } else {
      result = await debServices.getAllDebates();
    }

    if (result.success && result.debates.length > 0) {
      return res.status(200).json(result.debates);
    } else if (result.success && result.debates.length === 0) {
      return res.status(204).json({ success: false, message : " La solicitud se ha completado, pero no hay contenido para enviar" });
    } else if (result.success) {
      return res.status(400).json({ success: false, message: "Argumentos no coinciden" });
    } else {
      return res.status(401).json({ success: false, message: "Es necesario autenticar para obtener la respuesta solicitada. " });
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

    if (response.message === "Posición actualizada correctamente") {
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

// PUT /comment/:idComentario
exports.updateComment = async (req, res) => {
  const { idComentario } = req.params;
  const { position, argument } = req.body;
  const username = req.username;

  if (typeof position !== "boolean" || typeof argument !== "string") {
    return res.status(400).json({ message: "Argumentos no coinciden" }); // 400
  }

  try {
    const response = await debServices.updateComment(idComentario, username, position, argument);

    if (!response.success && response.message === "Comentario no encontrado.") {
      return res.status(404).json({ message: response.message }); // 404
    }

    if (!response.success && response.code === 401) {
      return res.status(401).json({ message: response.message });
    }

    return res.status(200).json({
      message: "La solicitud ha tenido éxito y el recurso ha sido actualizado.",
      data: response.data
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

