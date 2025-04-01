// models/publicationModel.js
const { db } = require("../config/database.config");

// Definición de la colección "publications" en Firebase
const pubCollection = db.collection("publications");

module.exports = { pubCollection };
