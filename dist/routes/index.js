"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const property_routes_1 = __importDefault(require("./property.routes"));
const favorite_routes_1 = __importDefault(require("./favorite.routes")); // Add this line
const router = express_1.default.Router();
router.use("/auth", auth_routes_1.default);
router.use("/properties", property_routes_1.default);
router.use("/favorites", favorite_routes_1.default); // Add this line
exports.default = router;
