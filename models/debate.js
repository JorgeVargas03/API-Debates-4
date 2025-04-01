// models/publicationModel.js
const { db } = require("../config/database.config");

// Definición de la colección "publications" en Firebase
const debateCollection = db.collection("Debates_Coleccion");

module.exports = { debateCollection };
