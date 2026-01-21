"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error("Error:", error.message);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
};
exports.errorHandler = errorHandler;
