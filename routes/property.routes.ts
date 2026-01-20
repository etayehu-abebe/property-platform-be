import { Router } from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  publishProperty,
} from "../controllers/property.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Protected routes
router.post("/", authenticate, authorize("OWNER", "ADMIN"), createProperty);
router.put("/:id", authenticate, authorize("OWNER", "ADMIN"), updateProperty);
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  deleteProperty
);
router.patch(
  "/:id/publish",
  authenticate,
  authorize("OWNER", "ADMIN"),
  publishProperty
);

export default router;
