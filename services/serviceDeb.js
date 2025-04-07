// services/serviceDeb.js
const { debateCollection } = require("../models/debate");

exports.getAllDebates = async () => {
  try {
    const snapshot = await debateCollection.get();
    const debates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, debates };
  } catch (error) {
    console.error("Error al obtener debates", error);
    return { success: false, message: "Error interno del servidor" };
  }
};
// Por categoría
exports.getDebatesByCategory = async (category) => {
  try {
    const snapshot = await debateCollection.get();
    const debates = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(debate => debate.category?.toLowerCase() === category.toLowerCase());

    return { success: true, debates };
  } catch (error) {
    console.error("Error al obtener debates por categoría", error);
    return { success: false, message: "Error interno del servidor" };
  }
};

exports.getDebatesByUser = async (username) => {
  try {
    const snapshot = await debateCollection
      .where("usernameCreate", "==", username)
      .get();

    const debates = snapshot.docs.map(doc => doc.data());
    return debates;
  } catch (error) {
    console.error("Error al obtener debates por usuario:", error);
    return [];
  }
};

// Por usuario autenticado
exports.getDebatesByUser = async (username) => {
  try {
    const snapshot = await debateCollection.get();
    const debates = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(debate => debate.usernameCreate?.toLowerCase() === username.toLowerCase());

    return { success: true, debates };
  } catch (error) {
    console.error("Error al obtener debates del usuario", error);
    return { success: false, message: "Error interno del servidor" };
  }
};

exports.createDebate = async (nameDebate, argument, category, username) => {
  try {
    const validCategories = [
      "Filosofía",
      "Política",
      "Cultura Pop",
      "Conspiraciones",
    ];
    if (!validCategories.includes(category)) {
      return { success: false, message: "Categoría no válida" };
    }

    const currentDate = new Date().toISOString();
    const newDebate = {
      idDebate: debateCollection.doc().id,
      nameDebate,
      argument,
      category,
      usernameCreate: username,
      datareg: currentDate,
      peopleInFavor: [],
      peopleAgainst: [],
      comments: [],
    };

    const debateRef = await debateCollection.add(newDebate);
    return {
      success: true,
      message: "La solicitud ha tenido éxito y se ha creado un nuevo recurso",
      id: debateRef.idDebate /*id: newDebate.idDebate, // Corrección aquí*/,
    };
  } catch (error) {
    console.error("Error al crear debate", error);
    return { success: false, message: "Error interno del servidor" };
  }
};

//● POST /debate/:id comentario
exports.setDebatePosition = async (debateId, username, position) => {
  try {
    // Buscar el debate usando el campo "idDebate" en lugar del ID de documento
    const debateRef = debateCollection.where("idDebate", "==", debateId);
    const debateSnapshot = await debateRef.get();

    if (debateSnapshot.empty) {
      return { message: "Debate no encontrado" }; // 404 Not found
    }

    // Obtener el primer debate que coincida (en este caso, debería haber solo uno)
    const debateDoc = debateSnapshot.docs[0];
    const debateData = debateDoc.data();

    let peopleInFavor = debateData.peopleInFavor || [];
    let peopleAgainst = debateData.peopleAgainst || [];

    // Eliminar al usuario de ambas listas antes de cambiar su postura
    peopleInFavor = peopleInFavor.filter((user) => user !== username);
    peopleAgainst = peopleAgainst.filter((user) => user !== username);

    // Agregar el usuario a la lista correcta según su nueva posición
    if (position) {
      peopleInFavor.push(username);
    } else {
      peopleAgainst.push(username);
    }

    // Actualizar el documento en Firestore
    await debateDoc.ref.update({
      peopleInFavor,
      peopleAgainst,
    });

    return { message: "Posición actualizada correctamente" }; // 200 OK
  } catch (error) {
    console.error("Error en setDebatePosition", error);
    return { message: "Error interno del servidor" }; // 500 Internal Server Error
  }
};

//● POST /debate/:id comentario
exports.addCommentToDebate = async (debateId, username, position, argument) => {
  try {
    // Asegúrate de que el nombre del campo es el correcto
    const debateRef = debateCollection.where("idDebate", "==", debateId); // Consulta correcta
    const debateSnapshot = await debateRef.get();

    if (debateSnapshot.empty) {
      console.log("No se encontró el debate con el idDebate:", debateId);
      return { success: false, message: "Debate no encontrado." }; // 404 Not found
    }

    const debateDoc = debateSnapshot.docs[0]; // Obtener el primer documento
    const debateData = debateDoc.data();

    let comments = debateData.comments || [];
    let peopleInFavor = debateData.peopleInFavor || [];
    let peopleAgainst = debateData.peopleAgainst || [];

    const currentDate = new Date().toISOString();

    // Crear el nuevo comentario
    const newComment = {
      idComment: `${Date.now()}`,
      username: username,
      position: position,
      argument: argument,
      datareg: currentDate,
    };

    // Agregar el nuevo comentario al array
    comments.push(newComment);

    // Agregar el usuario a la lista correspondiente
    if (position) {
      if (!peopleInFavor.includes(username)) {
        peopleInFavor.push(username);
      }
    } else {
      if (!peopleAgainst.includes(username)) {
        peopleAgainst.push(username);
      }
    }

    // Actualizar el documento de Firestore
    await debateDoc.ref.update({
      comments: comments,
      peopleInFavor: peopleInFavor,
      peopleAgainst: peopleAgainst,
    });

    // Respuesta exitosa
    return {
      success: true,
      message: "Comentario agregado exitosamente.",
      data: newComment,
    };

  } catch (error) {
    console.error("Error al agregar comentario", error);
    return { success: false, message: "Error interno del servidor." }; // 500
  }
};

//PUT /comment/:idComentario
exports.updateComment = async (idComment, username, newPosition, newArgument) => {
  try {
    const debateSnapshot = await debateCollection.get();

    for (let doc of debateSnapshot.docs) {
      const debateData = doc.data();
      let comments = debateData.comments || [];

      const commentIndex = comments.findIndex(c => c.idComment === idComment);

      if (commentIndex !== -1) {
        // Comentario encontrado
        const comment = comments[commentIndex];

        if (comment.username !== username) {
          return {
            success: false,
            code: 401,
            message: "No autorizado, no es el autor del comentario."
          };
        }
        const oldPosition = comment.position;

        // Actualizar el comentario
        comment.argument = newArgument;
        comment.position = newPosition;
        comment.dateEdit = new Date().toISOString();

        // Actualizar arrays de posición
        let peopleInFavor = debateData.peopleInFavor || [];
        let peopleAgainst = debateData.peopleAgainst || [];

        // Si cambió la posición, lo movemos de lista
        if (oldPosition !== newPosition) {
          if (oldPosition) {
            peopleInFavor = peopleInFavor.filter(user => user !== username);
            if (!peopleAgainst.includes(username)) peopleAgainst.push(username);
          } else {
            peopleAgainst = peopleAgainst.filter(user => user !== username);
            if (!peopleInFavor.includes(username)) peopleInFavor.push(username);
          }
        }

        // Guardar los cambios
        await doc.ref.update({
          comments,
          peopleInFavor,
          peopleAgainst,
        });

        return {
          success: true,
          data: comment,
        };
      }
    }

    return { success: false, message: "Comentario no encontrado." }; // 404
  } catch (error) {
    console.error("Error al actualizar comentario", error);
    return { success: false, message: "Error interno del servidor." }; // 500
  }
};

