// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

exports.authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado: No hay token' });
  }

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    req.user = verified;
    req.username = req.user.username; // Asigna el username a req.username 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
