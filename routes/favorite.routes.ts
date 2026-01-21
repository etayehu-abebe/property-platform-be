import express from "express";
import {
  favoriteProperty,
  unfavoriteProperty,
  getUserFavorites,
  checkIsFavorited,
  getPropertyFavoriteCount,
} from "../controllers/favorite.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";


const router = express.Router();

// Public route - get favorite count for property
router.get("/count/:propertyId", getPropertyFavoriteCount);

/** Protected routes - require authentication
    Only USER role can favorite properties */
router.post("/:id", authenticate, authorize("USER"), favoriteProperty);
router.delete("/:id", authenticate, authorize("USER"), unfavoriteProperty);
router.get("/", authenticate, authorize("USER"), getUserFavorites);
router.get("/check/:propertyId", authenticate, authorize("USER"), checkIsFavorited);

export default router;