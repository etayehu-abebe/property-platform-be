"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("../controllers/property.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", property_controller_1.getProperties);
router.get("/:id", property_controller_1.getPropertyById);
// Protected routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("OWNER", "ADMIN"), property_controller_1.createProperty);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("OWNER", "ADMIN"), property_controller_1.updateProperty);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("OWNER", "ADMIN"), property_controller_1.deleteProperty);
router.patch("/:id/publish", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("OWNER", "ADMIN"), property_controller_1.publishProperty);
exports.default = router;
