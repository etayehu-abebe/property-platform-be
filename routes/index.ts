import express from "express";
import authRoutes from "./auth.routes";
import propertyRoutes from "./property.routes";
import favoriteRoutes from "./favorite.routes"; // Add this line

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/favorites", favoriteRoutes); // Add this line

export default router;