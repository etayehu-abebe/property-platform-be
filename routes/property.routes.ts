import { Router } from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  publishProperty,
  getPropertiesByOwner,
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

// Get current owner's properties (no ownerId in path)
router.get('/owner/my-properties', authenticate, authorize('OWNER', 'ADMIN'), getPropertiesByOwner)

// Route 2: Get specific owner's properties (ownerId in path)
router.get('/owner/:ownerId', authenticate, authorize('OWNER', 'ADMIN'), getPropertiesByOwner)

export default router;
