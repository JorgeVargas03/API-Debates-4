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
    const username  = req.username; // Obtiene el nombre del usuario desde el middleware
    const { titule, argument, category } = req.body;

    const response = await debServices.createDebate(title, argument, category, username);

    if (response.success) {
      return res.status(201).json({ success: true, message: response.message, id: response.id });
    } else {
      return res.status(400).json({ success: false, message: response.message });
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
  const  username  = req.username; // Obtiene el nombre del usuario desde el middleware

  if (typeof position !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "Argumentos no coinciden" });
  }

  try {
    const response = await debServices.setDebatePosition(
      id,
      username,
      position
    );

    if (response.success) {
      return res.status(200).json({ success: true, message: response.message });
    } else {
      return res
        .status(404)
        .json({ success: false, message: response.message });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

//● POST /debate/:id/comentario - Agregar un comentario a un debate
exports.addCommentToDebate = async (req, res) => {
  const { id } = req.params; // Obtiene el ID del debate desde la URL
  const { position, argument } = req.body; // Obtiene la postura y el argumento del cuerpo de la solicitud
  const  username  = req.username; // Obtiene el nombre del usuario desde el middleware

  if (typeof position !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "Argumentos no coinciden" });
  }

  try {
    const response = await debServices.addCommentToDebate(
      id,
      username,
      position,
      argument
    );

    if (response.success) {
      return res.status(200).json({
        success: true,
        message: response.message,
        data: response.data,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: response.message });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};
