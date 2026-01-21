"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyFavoriteCount = exports.checkIsFavorited = exports.getUserFavorites = exports.unfavoriteProperty = exports.favoriteProperty = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Add property to favorites
const favoriteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyId = Array.isArray(id) ? id[0] : id;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if property exists and is not deleted
        const property = await prisma_1.default.property.findFirst({
            where: { id: propertyId, deletedAt: null },
        });
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        // Check if already favorited
        const existingFavorite = await prisma_1.default.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });
        if (existingFavorite) {
            return res.status(400).json({ error: "Property already favorited" });
        }
        // Create favorite
        const favorite = await prisma_1.default.favorite.create({
            data: {
                userId,
                propertyId,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        location: true,
                        price: true,
                        images: true,
                        // bedrooms: true,
                        // bathrooms: true,
                        // area: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
        res.status(201).json(favorite);
    }
    catch (error) {
        console.error("Favorite property error:", error);
        res.status(500).json({ error: "Failed to favorite property" });
    }
};
exports.favoriteProperty = favoriteProperty;
// Remove property from favorites
const unfavoriteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyId = Array.isArray(id) ? id[0] : id;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Find the favorite
        const favorite = await prisma_1.default.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });
        if (!favorite) {
            return res.status(404).json({ error: "Favorite not found" });
        }
        // Delete the favorite
        await prisma_1.default.favorite.delete({
            where: {
                id: favorite.id,
            },
        });
        res.json({ message: "Property removed from favorites" });
    }
    catch (error) {
        console.error("Unfavorite property error:", error);
        res.status(500).json({ error: "Failed to remove favorite" });
    }
};
exports.unfavoriteProperty = unfavoriteProperty;
// Get user's favorites
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { page = "1", limit = "10", } = req.query;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [favorites, total] = await Promise.all([
            prisma_1.default.favorite.findMany({
                where: {
                    userId,
                    property: {
                        deletedAt: null, // Only include non-deleted properties
                    },
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            location: true,
                            price: true,
                            images: true,
                            // bedrooms: true,
                            // bathrooms: true,
                            // area: true,
                            status: true,
                            createdAt: true,
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: parseInt(limit),
            }),
            prisma_1.default.favorite.count({
                where: {
                    userId,
                    property: {
                        deletedAt: null,
                    },
                },
            }),
        ]);
        res.json({
            favorites,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get favorites error:", error);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
};
exports.getUserFavorites = getUserFavorites;
// Check if property is favorited by user
const checkIsFavorited = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const pid = Array.isArray(propertyId) ? propertyId[0] : propertyId;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const favorite = await prisma_1.default.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId: pid,
                },
            },
        });
        res.json({
            isFavorited: !!favorite,
            favoriteId: favorite?.id || null,
        });
    }
    catch (error) {
        console.error("Check favorite error:", error);
        res.status(500).json({ error: "Failed to check favorite status" });
    }
};
exports.checkIsFavorited = checkIsFavorited;
// Get favorite count for a property
const getPropertyFavoriteCount = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const pid = Array.isArray(propertyId) ? propertyId[0] : propertyId;
        const count = await prisma_1.default.favorite.count({
            where: {
                propertyId: pid,
                property: {
                    deletedAt: null,
                },
            },
        });
        res.json({ count });
    }
    catch (error) {
        console.error("Get favorite count error:", error);
        res.status(500).json({ error: "Failed to get favorite count" });
    }
};
exports.getPropertyFavoriteCount = getPropertyFavoriteCount;
