const express = require("express");
const router = express.Router();
const controllerDeb = require("../controllers/debController");

const { authenticateToken } = require('../middleware/authMiddleware');

//Endpoint para ver todos los debates
router.get("/debates", authenticateToken, controllerDeb.getAllDebates);

//Nueva ruta pública para ver debates de cualquier usuario
router.get("/debates/public", authenticateToken, controllerDeb.getPublicDebates);

//Endpoint para agregar un debate
router.post('/debate', authenticateToken, controllerDeb.addDebate);

//Endpoint para definir la postura sobre un tema
router.post("/debate/:id/position", authenticateToken, controllerDeb.setDebatePosition);

//Endpoint para agregar comentario a un debate
router.post("/debate/:id", authenticateToken, controllerDeb.addCommentToDebate);

//Endpoint para editar un comentario 
router.put("/comment/:idComentario", authenticateToken, controllerDeb.updateComment);

// Eliminar un comentario
router.delete("/comment/:idComentario", authenticateToken, controllerDeb.deleteComment);

module.exports = router;
