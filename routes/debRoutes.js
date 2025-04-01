const express = require("express");
const router = express.Router();
const controllerPubs = require("../controllers/pubsController");

const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route GET /publication
 * @description Obtiene todas las publicaciones.
 * @returns {Array} 200 - Una lista de publicaciones
 * @returns {Object} 404 - Mensaje si no se encuentran publicaciones
 * @returns {Object} 500 - Mensaje de error
 */
router.get("/publication", authenticateToken, controllerPubs.getAllPublications);

/**
 * @route GET /publication/:id
 * @description Obtiene una publicación por su ID.
 * @param {string} id - El ID de la publicación que se desea obtener.
 * @returns {Object} 200 - La publicación encontrada.
 * @returns {Object} 404 - Mensaje si no se encuentra la publicación.
 * @returns {Object} 500 - Mensaje de error.
 */
router.get("/publication/:id", authenticateToken, controllerPubs.getPublicationById);

/**
 * @route POST /publication
 * @description Crea una nueva publicación con los datos proporcionados.
 * @body {Object} publication - Los datos de la nueva publicación.
 * @bodyParam {string} author - El autor de la publicación.
 * @bodyParam {string} title - El título de la publicación.
 * @bodyParam {string} content - El contenido de la publicación.
 * @returns {Object} 201 - La publicación creada exitosamente.
 * @returns {Object} 400 - Mensaje si los datos proporcionados son inválidos.
 * @returns {Object} 500 - Mensaje de error.
 */
router.post("/publication", authenticateToken, controllerPubs.createPublication);

/**
 * @route DELETE /publication/:id
 * @description Elimina una publicación por su ID.
 * @param {string} id - El ID de la publicación que se desea eliminar.
 * @returns {Object} 200 - Mensaje confirmando que la publicación fue eliminada.
 * @returns {Object} 404 - Mensaje si la publicación no existe.
 * @returns {Object} 500 - Mensaje de error si ocurre un problema en la eliminación.
 */
router.delete("/publication/:id", authenticateToken, controllerPubs.deletePublication);

/**
 * @route PUT /publication/:id
 * @description Actualiza una publicación existente por su ID.
 * @param {string} id - El ID de la publicación que se desea actualizar.
 * @body {Object} body - Los campos a actualizar de la publicación (title, content).
 * @returns {Object} 200 - Publicación actualizada exitosamente.
 * @returns {Object} 404 - Mensaje si la publicación no existe.
 * @returns {Object} 500 - Mensaje de error si ocurre un problema en la actualización.
 */
router.put("/publication/:id", authenticateToken, controllerPubs.updatePublication);

/**
 * @route GET /publication/:idPub/comments
 * @description Obtiene los comentarios de una publicación.
 * @param {string} idPub - El ID de la publicación.
 * @returns {Array} 200 - Lista de comentarios.
 * @returns {Object} 404 - Mensaje si la publicación o comentarios no existen.
 * @returns {Object} 500 - Mensaje de error.
 */
router.get("/publication/:idPub/comments", authenticateToken, controllerPubs.getComments);

//POST /debate/position/:id Elegir si el usuario está a favor o en contra en el debate Jorge
router.post("/debate/:idPub/comment", authenticateToken, controllerPubs.addCommentToPublication);

/**
 * @route DELETE /publication/:idPub/comment/:idComment
 * @description Elimina un comentario de una publicación.
 * @param {string} idPub - El ID de la publicación.
 * @param {string} idComment - El ID del comentario.
 * @returns {Object} 200 - Confirmación de eliminación.
 * @returns {Object} 404 - Comentario o publicación no encontrado.
 * @returns {Object} 500 - Mensaje de error.
 */
router.delete("/publication/:idPub/comment/:idComment", authenticateToken, controllerPubs.deleteComment);

/**
 * @route PUT /publication/:idPub/comment/:idComment
 * @description Actualiza un comentario de una publicación.
 * @param {string} idPub - El ID de la publicación.
 * @param {string} idComment - El ID del comentario.
 * @body {Object} body - Datos a actualizar del comentario.
 * @bodyParam {string} content - Nuevo contenido del comentario.
 * @returns {Object} 200 - Comentario actualizado exitosamente.
 * @returns {Object} 404 - Comentario o publicación no encontrado.
 * @returns {Object} 500 - Mensaje de error.
 */
router.put("/publication/:idPub/comment/:idComment", authenticateToken, controllerPubs.updateComment);

/**
 * @route PATCH /publication/:idPub/comment/:idComment/like
 * @description Actualiza los likes de un comentario (agregar o quitar likes).
 * @param {string} idPub - El ID de la publicación.
 * @param {string} idComment - El ID del comentario.
 * @returns {Object} 200 - Confirmación de actualización.
 * @returns {Object} 404 - Comentario o publicación no encontrado.
 * @returns {Object} 500 - Mensaje de error.
 */
router.patch("/publication/:idPub/comment/:idComment/like", authenticateToken, controllerPubs.updateLikeComment);

/**
 * @route GET /publication/trends/popular
 * @description Obtiene las publicaciones más populares.
 * @returns {Array} 200 - Lista de publicaciones populares.
 * @returns {Object} 500 - Mensaje de error.
 */
router.get("/publication/trends/popular", authenticateToken, controllerPubs.getMostTrend);

module.exports = router;
