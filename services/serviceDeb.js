// services/serviceDeb.js
const { debateCollection } = require("../models/debate");

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
      message: "Debate creado exitosamente",
      id: idDebate,
    };
  } catch (error) {
    console.error("Error al crear debate", error);
    return { success: false, message: "Error interno del servidor" };
  }
};

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
    // Buscar el debate usando el campo "idDebate" en lugar del ID de documento
    const debateRef = debateCollection.where("idDebate", "==", debateId); // Busca por el campo "idDebate"
    const debateSnapshot = await debateRef.get();

    if (debateSnapshot.empty) {
      console.log("No se encontró el debate con el idDebate:", debateId);
      return { success: false, message: "Debate no encontrado" };
    }

    // Obtener el primer debate que coincida (en este caso, debería haber solo uno)
    const debateDoc = debateSnapshot.docs[0];
    const debateData = debateDoc.data();

    let comments = debateData.comments || [];
    let peopleInFavor = debateData.peopleInFavor || [];
    let peopleAgainst = debateData.peopleAgainst || [];

    const currentDate = new Date().toISOString();

    // Crear un nuevo comentario con un id autogenerado
    const newComment = {
      idComment: `${Date.now()}`, // Generar un ID único basado en el timestamp
      username: username,
      position: position,
      argument: argument,
      datareg: currentDate,
    };

    // Agregar el nuevo comentario al array de comentarios
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

    // Actualizar el documento con los nuevos comentarios y las listas de personas a favor y en contra
    await debateDoc.ref.update({
      comments: comments,
      peopleInFavor: peopleInFavor,
      peopleAgainst: peopleAgainst,
    });

    // Retornar la respuesta con el nuevo comentario y su ID generado
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
