// models/publicationModel.js
const { db } = require("../config/database.config.js");

// Definición de la colección "publications" en Firebase
const userCollection = db.collection("users");

module.exports = { userCollection };
