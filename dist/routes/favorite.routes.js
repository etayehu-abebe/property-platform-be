"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favorite_controller_1 = require("../controllers/favorite.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public route - get favorite count for property
router.get("/count/:propertyId", favorite_controller_1.getPropertyFavoriteCount);
/** Protected routes - require authentication
    Only USER role can favorite properties */
router.post("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("USER"), favorite_controller_1.favoriteProperty);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("USER"), favorite_controller_1.unfavoriteProperty);
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("USER"), favorite_controller_1.getUserFavorites);
router.get("/check/:propertyId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("USER"), favorite_controller_1.checkIsFavorited);
exports.default = router;
