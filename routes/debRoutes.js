const express = require("express");
const router = express.Router();
const controllerPubs = require("../controllers/debController");

const { authenticateToken } = require('../middleware/authMiddleware');




router.post("/publication/id/position", authenticateToken, controllerPubs.createPublication);

module.exports = router;
