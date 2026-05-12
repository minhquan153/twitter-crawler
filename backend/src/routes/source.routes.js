const express = require("express");
const sourceController = require("../controllers/source.controller");
const adminAuth = require("../middleware/adminAuth");
const validateObjectId = require("../middleware/validateObjectId");
const validateRequest = require("../middleware/validateRequest");
const {
  createSourceSchema,
  updateSourceSchema,
} = require("../middleware/source.validator");


const router = express.Router();

router.get("/", sourceController.listSources);
router.post(
  "/",
  adminAuth,
  validateRequest(createSourceSchema),
  sourceController.createSource
);

router.patch(
  "/:id",
  adminAuth,
  validateObjectId,
  validateRequest(updateSourceSchema),
  sourceController.updateSource
);
router.delete("/:id", adminAuth, validateObjectId, sourceController.removeSource);

module.exports = router;
