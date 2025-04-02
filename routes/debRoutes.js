const express = require("express");
const router = express.Router();
const controllerDeb = require("../controllers/debController");

const { authenticateToken } = require('../middleware/authMiddleware');

router.post("/debate/:id/position", authenticateToken, controllerDeb.setDebatePosition);

router.post("/debate/:id", authenticateToken, controllerDeb.addCommentToDebate);

module.exports = router;
