const admin = require("firebase-admin");
const serviceAccount = require("./firebaseConfig"); // Asegúrate de que este archivo existe

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Inicializa Firestore

module.exports = { db };
