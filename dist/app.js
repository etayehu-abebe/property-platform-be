"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"] // Change for production
        : ["http://localhost:3000", "http://localhost:3001"], // Development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/properties", property_routes_1.default);
app.use("/api/favorites", favorite_routes_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});
// Simple 404 handler - works with all Express versions
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
    });
});
// Error handler
app.use(error_middleware_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
