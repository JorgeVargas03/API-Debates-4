const express = require("express");
const router = express.Router();
const controllerPubs = require("../controllers/pubsController");

const { authenticateToken } = require('../middleware/authMiddleware');


router.get("/publication", authenticateToken, controllerPubs.getAllPublications);


router.get("/publication/:id", authenticateToken, controllerPubs.getPublicationById);


router.post("/publication", authenticateToken, controllerPubs.createPublication);


router.delete("/publication/:id", authenticateToken, controllerPubs.deletePublication);


router.put("/publication/:id", authenticateToken, controllerPubs.updatePublication);


module.exports = router;
