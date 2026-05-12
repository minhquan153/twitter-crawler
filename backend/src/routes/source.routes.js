const express = require("express");
const sourceController = require("../controllers/source.controller");
const adminAuth = require("../middleware/adminAuth");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", sourceController.listSources);
router.post("/", adminAuth, sourceController.createSource);
router.patch("/:id", adminAuth, validateObjectId, sourceController.updateSource);
router.delete("/:id", adminAuth, validateObjectId, sourceController.removeSource);

module.exports = router;
