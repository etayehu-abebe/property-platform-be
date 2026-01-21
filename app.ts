import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import favoriteRoutes from "./routes/favorite.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://property-platform-fe.vercel.app"] // Change for production
      : ["http://localhost:3000", "http://localhost:3001"], // Development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes)
app.use("/api/favorites", favoriteRoutes)

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
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
