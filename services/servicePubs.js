// services/publicationService.js
const { pubCollection } = require("../models/publicacion");

// Obtener todas las publicaciones
exports.getPublications = async () => {
  try {
    const snapshot = await pubCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error al obtener publicaciones: ${error.message}`);
  }
};

// Obtener una publicación específica por ID
exports.getPublicationById = async (id) => {
  try {
    const pubRef = pubCollection.doc(id);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      return null; // No lanzar error, solo devolver null
    }
    return { id: pubSnapshot.id, ...pubSnapshot.data() };
  } catch (error) {
    throw new Error(`Error al obtener la publicación`);
  }
};

// Agregar una nueva publicación
exports.addPublication = async (author, title, content) => {
  console.log("Añadiendo publicación:", { author, title, content });

  const datePub = new Date().toISOString();
  const newPub = await pubCollection.add({
    author,
    title,
    content,
    datePub,
    comentarios: [],
    popularidad: 0,
  });

  return {
    id: newPub.id,
    author,
    title,
    content,
    datePub,
    comentarios: [],
    popularidad: 0,
  };
};

// Eliminar una publicación por ID
exports.deletePublication = async (id) => {
  try {
    const pubRef = pubCollection.doc(id);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      return { success: false, message: "Publicación no encontrada" };
    }

    await pubRef.delete();
    return { success: true, message: "Publicación eliminada correctamente" };
  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar la publicación: ${error.message}`,
    };
  }
};

// Actualizar una publicación por ID (solo título y contenido, manteniendo comentarios)
exports.updatePublication = async (id, { title, content }) => {
  try {
    const pubRef = pubCollection.doc(id);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      return {
        error: true,
        statusCode: 404,
        message: `Publicación con ID ${id} no encontrada.`,
      };
    }

    // Obtener los valores actuales de la publicación
    const pubData = pubSnapshot.data();

    // Actualizar solo el título y el contenido
    await pubRef.update({ title, content });

    return {
      id,
      comentarios: pubData.comentarios ?? [],
      author: pubData.author,
      title,
      content,
      datePub: pubData.datePub,
      popularidad: pubData.popularidad ?? 0,
    };
  } catch (error) {
    console.error(`Error en updatePublication: ${error.message}`);
    return {
      error: true,
      statusCode: 500,
      message: `Error al actualizar la publicación: ${error.message}`,
    };
  }
};

//Consultar los comentarios de una publicacion
exports.getCommentsByPublication = async (pubId) => {
  try {
    const pubRef = pubCollection.doc(pubId);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      throw new Error("Publicación no encontrada");
    }

    let pubData = pubSnapshot.data();
    let comentarios = pubData.comentarios || []; // Si no hay comentarios, retorna un array vacío

    return comentarios;
  } catch (error) {
    throw new Error(`Error al obtener los comentarios: ${error.message}`);
  }
};

// Agregar un comentario a una publicación
exports.addCommentToPublication = async (pubId, comment) => {
  try {
    const pubRef = pubCollection.doc(pubId);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      throw new Error("Publicación no encontrada"); // Lanza un error claro
    }

    // Validar si el comentario contiene palabras prohibidas
    if (validateComment(comment.contenido)) {
      throw new Error("Comentario no permitido por lenguaje inapropiado.");
    }

    const pubData = pubSnapshot.data();
    const comentarios = Array.isArray(pubData.comentarios)
      ? pubData.comentarios
      : [];

    // Determinar el ID autoincrementable
    const newCommentId =
      comentarios.length > 0
        ? Math.max(...comentarios.map((c) => c.id)) + 1
        : 1;

    // Crear nuevo comentario con la estructura requerida
    const newComment = {
      id: newCommentId,
      usuario: comment.usuario,
      contenido: comment.contenido,
      fechaComentario: new Date().toISOString(),
      likes: 0,
    };

    // Agregar el comentario a la lista
    comentarios.push(newComment);

    // Guardar los comentarios actualizados en la publicación
    await pubRef.update({ comentarios });

    return newComment;
  } catch (error) {
    console.error("Error al agregar comentario", error);
    throw error; // Propaga el error para que sea manejado en el controlador
  }
};

// Lista de palabras prohibidas
const palabrasProhibidas = [
  "idiota",
  "imbécil",
  "estúpido",
  "tonto",
  "mierda",
  "maldito",
  "cabron",
  "pendejo",
  "jodido",
  "coño",
  "chingado",
  "puto",
  "zorra",
  "tarado",
  "baboso",
  "culero",
  "marica",
  "huevon",
  "pelotudo",
  "gilipollas",
  "pajero",
  "naco",
  "puta",
  "cabrón",
];

// Función para validar comentarios
function validateComment(comment) {
  return palabrasProhibidas.some((palabra) =>
    comment.toLowerCase().includes(palabra)
  );
}
// Eliminar un comentario de una publicación
exports.deleteCommentFromPublication = async (pubId, commentIndex) => {
  try {
    console.log("Buscando publicación con ID:", pubId);

    const pubRef = pubCollection.doc(pubId);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      return {
        error: true,
        statusCode: 404,
        message: "Publicación no encontrada",
      };
    }

    let pubData = pubSnapshot.data();
    let comentarios = pubData.comentarios || [];
    let popularidad = pubData.popularidad || 0; // Obtener popularidad actual

    const index = parseInt(commentIndex, 10);

    const commentToDelete = comentarios.find(
      (comment) => parseInt(comment.id, 10) === index
    );

    if (!commentToDelete) {
      return {
        error: true,
        statusCode: 404,
        message: "Comentario no encontrado",
      };
    }

    // Restar los likes del comentario eliminado a la popularidad
    popularidad -= commentToDelete.likes;

    // Filtrar el comentario que se va a eliminar
    const newComments = comentarios.filter(
      (comment) => parseInt(comment.id, 10) !== index
    );

    // Actualizar la publicación con los comentarios y la nueva popularidad
    await pubRef.update({ comentarios: newComments, popularidad });

    return { id: pubId, comentarios: newComments, popularidad };
  } catch (error) {
    console.error(`Error en deleteCommentFromPublication: ${error.message}`);
    return {
      error: true,
      statusCode: 500,
      message: `Error al eliminar comentario: ${error.message}`,
    };
  }
};

exports.updateCommentInPublication = async (pubId, commentId, newContent) => {
  try {
    if (typeof newContent !== "string" || newContent.trim() === "") {
      throw new Error(
        "El contenido del comentario debe ser un texto no vacío."
      );
    }

    if (validateComment(newContent)) {
      throw new Error("Comentario no permitido por lenguaje inapropiado.");
    }

    const parsedCommentId = parseInt(commentId, 10);
    if (isNaN(parsedCommentId)) {
      throw new Error("ID de comentario inválido");
    }

    const pubRef = pubCollection.doc(pubId);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      throw new Error("Publicación no encontrada");
    }

    const pubData = pubSnapshot.data();
    const comentarios = pubData.comentarios || [];

    const commentIndex = comentarios.findIndex(
      (comment) => comment.id === parsedCommentId
    );

    if (commentIndex === -1) {
      throw new Error("Comentario no encontrado");
    }

    const updatedComment = {
      ...comentarios[commentIndex],
      contenido: newContent,
      fechaModificacion: new Date().toISOString(),
    };

    comentarios[commentIndex] = updatedComment;

    await pubRef.update({ comentarios });

    return {
      comentarioActualizado: updatedComment,
      comentarios,
    };
  } catch (error) {
    console.error(
      "Error al actualizar comentario:",
      error.message,
      error.stack
    ); // Agrega el stacktrace para más detalles
    throw error; // Propagar el error real
  }
};

// Actualizar el like en un comentario
exports.updateLikeComment = async (pubId, commentId, increment = true) => {
  try {
    const pubRef = pubCollection.doc(pubId);
    const pubSnapshot = await pubRef.get();

    if (!pubSnapshot.exists) {
      return { success: false, message: "Publicación no encontrada" };
    }

    let pubData = pubSnapshot.data();
    let comments = pubData.comentarios || [];
    let popularidad = pubData.popularidad || 0; // Obtener popularidad actual

    console.log("Comentarios en la publicación:", comments);
    console.log("Buscando comentario con ID:", commentId);

    const commentIndex = comments.findIndex(
      (c) => String(c.id) === String(commentId)
    );

    if (commentIndex === -1) {
      return { success: false, message: "Comentario no encontrado" };
    }

    let currentLikes = comments[commentIndex].likes || 0;

    // Solo reducir likes si hay al menos 1
    if (!increment && currentLikes === 0) {
      return {
        success: false,
        message: "No se pueden reducir likes por debajo de 0",
      };
    }

    // Actualizar los likes del comentario
    comments[commentIndex].likes = currentLikes + (increment ? 1 : -1);

    // Aumentar o disminuir la popularidad SOLO si se realizó un cambio en los likes
    if (increment) {
      popularidad += 1;
    } else if (currentLikes > 0) {
      popularidad = Math.max(0, popularidad - 1);
    }

    // Actualizar en la base de datos
    await pubRef.update({ comentarios: comments, popularidad });

    return { success: true, comentarios: comments, popularidad };
  } catch (error) {
    console.error("Error en updateLikeComment", error);
    return {
      success: false,
      message: `Error al actualizar likes`,
    };
  }
};

// Obtener las 5 publicaciones más populares
exports.getTrend = async () => {
  try {
    const snapshot = await pubCollection
      .orderBy("popularidad", "desc")
      .limit(5)
      .get();

    // Verifica si hay publicaciones
    if (snapshot.empty) {
      throw new Error("No se encontraron publicaciones populares");
    }

    // Transforma el snapshot en un array de publicaciones
    const publicaciones = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // Agrega el id de la publicación al objeto
    });

    return publicaciones; // Devuelve el array de publicaciones
  } catch (error) {
    throw new Error(
      error.message || "Error al obtener publicaciones más populares"
    );
  }
};
