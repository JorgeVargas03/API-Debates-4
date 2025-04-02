const { debateCollection } = require("../models/debate");

//● POST /debate/:id comentario
exports.setDebatePosition = async (debateId, username, position) => {
  try {
    const debateRef = debateCollection.doc(debateId);
    const debateSnapshot = await debateRef.get();

    if (!debateSnapshot.exists) {
      return { success: false, message: "Debate no encontrado" };
    }

    let debateData = debateSnapshot.data();
    let peopleInFavor = debateData.peopleInFavor || [];
    let peopleAgainst = debateData.peopleAgainst || [];

    // Verificar si el usuario ya está en alguna de las listas
    if (peopleInFavor.includes(username)) {
      peopleInFavor = peopleInFavor.filter((user) => user !== username);
    } else if (peopleAgainst.includes(username)) {
      peopleAgainst = peopleAgainst.filter((user) => user !== username);
    }

    // Alternar la postura del usuario
    if (position) {
      peopleInFavor.push(username);
    } else {
      peopleAgainst.push(username);
    }

    // Actualizar las listas de personas a favor y en contra en la base de datos
    await debateRef.update({
      peopleInFavor,
      peopleAgainst,
    });

    return { success: true, message: "Posición actualizada exitosamente" };
  } catch (error) {
    console.error("Error en setDebatePosition", error);
    return { success: false, message: "Error interno del servidor" };
  }
};

//● POST /debate/:id comentario
exports.addCommentToDebate = async (debateId, username, position, argument) => {
  try {
    const debateRef = debateCollection.doc(debateId);
    const debateSnapshot = await debateRef.get();

    if (!debateSnapshot.exists) {
      return { success: false, message: "Debate no encontrado" };
    }

    let debateData = debateSnapshot.data();
    let comments = debateData.comments || [];
    let peopleInFavor = debateData.peopleInFavor || [];
    let peopleAgainst = debateData.peopleAgainst || [];

    // Obtener la fecha actual
    const currentDate = new Date().toISOString();

    // Crear el nuevo comentario con un id generado automáticamente por Firebase
    const newComment = {
      username: username,
      position: position,
      argument: argument,
      datareg: currentDate,
    };

    // Agregar el comentario a la lista de comentarios
    comments.push(newComment);

    // Si la posición es a favor (true), agregar el usuario a peopleInFavor
    if (position) {
      if (!peopleInFavor.includes(username)) {
        peopleInFavor.push(username);
      }
    } else {
      if (!peopleAgainst.includes(username)) {
        peopleAgainst.push(username);
      }
    }

    // Actualizar los comentarios y las listas de personas a favor y en contra en la base de datos
    await debateRef.update({
      comments: comments,
      peopleInFavor: peopleInFavor,
      peopleAgainst: peopleAgainst,
    });

    return {
      success: true,
      message: "Comentario agregado exitosamente",
      data: newComment,
    };
  } catch (error) {
    console.error("Error al agregar comentario", error);
    return { success: false, message: "Error interno del servidor" };
  }
};
