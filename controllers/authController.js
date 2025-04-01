// controllers/authController.js
const { userCollection } = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Validar que el body tenga los campos requeridos
  if (!username || !password) {
    return res.status(400).json({
      message: "El nombre de usuario y la contraseña son obligatorios",
    });
  }

  try {
    // Verificar si el usuario ya existe en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo documento en la colección de usuarios con ID automático
    const newUserRef = await userCollection.add({
      username,
      password: hashedPassword,
    });

    // Obtener el ID asignado automáticamente
    const userId = newUserRef.id;

    res
      .status(201)
      .json({ message: "Usuario registrado correctamente", userId });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

// Función para iniciar sesión
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar al usuario por nombre de usuario en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();
    if (userSnapshot.empty) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Comparar la contraseña proporcionada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const time = "600s";
    // Generar un token JWT
    const token = jwt.sign(
      { userId: userDoc.id, username: user.username },
      SECRET_KEY,
      { expiresIn: time }
    );

    res.json({ token, info: `Sesión válida durante ${time}` });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
