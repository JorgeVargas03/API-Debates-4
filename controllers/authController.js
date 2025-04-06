// controllers/authController.js
const { userCollection } = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Validar credenciales
  const validation = await validateCredentials(username, password);
  if (!validation.valid) {
    return res.status(400).json({ message: "Las credenciales no coinciden" });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const newUserRef = await userCollection.add({ username, password: hashedPassword });

    res.status(200).json({ message: "La solicitud se ha completado con exito" +
      ". Usuario registrado correctamente", userId: newUserRef.id });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
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
      return res.status(400).json({ message: "Argumentos no coinciden" });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Comparar la contraseña proporcionada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Argumentos no coinciden" });
    }

    const time = "30m";
    // Generar un token JWT
    const token = jwt.sign(
      { userId: userDoc.id, username: user.username },
      SECRET_KEY,
      { expiresIn: time }
    );

    res.status(200).json({ token, info: `La solicitud se ha completado con éxito. Sesion: ${time}` });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

const validateCredentials = async (username, password) => {
  // Validar que el username no tenga espacios y no supere los 16 caracteres
  if (!username || username.includes(" ") || username.length > 16) {
    return { valid: false, message: "El nombre de usuario no es válido, no se admite dejar en blanco, usar espacios, o exceder de 16 caracteres" };
  }

  // Validar que la contraseña tenga al menos 8 caracteres y no tenga espacios
  if (!password || password.length < 8 || password.includes(" ")) {
    return { valid: false, message: "La contraseña no cumple con los requisitos. Requisitos: mínimo 8 caracteres, NO espacios en blanco" };
  }

  try {
    // Verificar si el usuario ya existe en Firestore
    const userSnapshot = await userCollection.where("username", "==", username).get();
    if (!userSnapshot.empty) {
      return { valid: false, message: "El nombre de usuario ya está en uso" };
    }

    return { valid: true, message: "Credenciales válidas" };
  } catch (error) {
    return { valid: false, message: "Error al validar credenciales" };
  }
};

