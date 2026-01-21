"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteProperty = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.publishProperty = exports.getProperties = exports.createProperty = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createProperty = async (req, res) => {
    try {
        const { title, description, location, price, images } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const property = await prisma_1.default.property.create({
            data: {
                title,
                description,
                location,
                price: parseFloat(price),
                images: images || [],
                ownerId: userId,
                status: "DRAFT",
            },
        });
        res.status(201).json(property);
    }
    catch (error) {
        console.error("Create property error:", error);
        res.status(500).json({ error: "Failed to create property" });
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    try {
        const { page = "1", limit = "10", status, minPrice, maxPrice, location, } = req.query;
        const where = { deletedAt: null };
        if (status)
            where.status = status;
        if (location)
            where.location = { contains: location, mode: "insensitive" };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [properties, total] = await Promise.all([
            prisma_1.default.property.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: { owner: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.default.property.count({ where }),
        ]);
        res.json({
            properties,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get properties error:", error);
        res.status(500).json({ error: "Failed to fetch properties" });
    }
};
exports.getProperties = getProperties;
const publishProperty = async (req, res) => {
    try {
        const { id } = req.params;
        // FIX: Ensure id is string, not array
        const propertyId = Array.isArray(id) ? id[0] : id;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId, deletedAt: null },
        });
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        if (property.ownerId !== userId && userRole !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Not authorized to publish this property" });
        }
        if (!property.title ||
            !property.description ||
            !property.location ||
            !property.price ||
            property.images.length === 0) {
            return res
                .status(400)
                .json({ error: "Property missing required fields for publishing" });
        }
        const updatedProperty = await prisma_1.default.$transaction(async (tx) => {
            return await tx.property.update({
                where: { id: propertyId },
                data: {
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
            });
        });
        res.json(updatedProperty);
    }
    catch (error) {
        console.error("Publish property error:", error);
        res.status(500).json({ error: "Failed to publish property" });
    }
};
exports.publishProperty = publishProperty;
// Add missing basic CRUD operations
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyId = Array.isArray(id) ? id[0] : id;
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId, deletedAt: null },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        res.json(property);
    }
    catch (error) {
        console.error("Get property error:", error);
        res.status(500).json({ error: "Failed to fetch property" });
    }
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyId = Array.isArray(id) ? id[0] : id;
        const userId = req.user?.userId;
        const { title, description, location, price, images } = req.body;
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId, deletedAt: null },
        });
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        if (property.ownerId !== userId) {
            return res
                .status(403)
                .json({ error: "Not authorized to update this property" });
        }
        // Can't edit published properties
        if (property.status === "PUBLISHED") {
            return res
                .status(400)
                .json({ error: "Published properties cannot be edited" });
        }
        const updatedProperty = await prisma_1.default.property.update({
            where: { id: propertyId },
            data: {
                title: title || property.title,
                description: description || property.description,
                location: location || property.location,
                price: price ? parseFloat(price) : property.price,
                images: images || property.images,
            },
        });
        res.json(updatedProperty);
    }
    catch (error) {
        console.error("Update property error:", error);
        res.status(500).json({ error: "Failed to update property" });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyId = Array.isArray(id) ? id[0] : id;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const property = await prisma_1.default.property.findUnique({
            where: { id: propertyId, deletedAt: null },
        });
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        if (property.ownerId !== userId && userRole !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Not authorized to delete this property" });
        }
        // Soft delete
        await prisma_1.default.property.update({
            where: { id: propertyId },
            data: { deletedAt: new Date() },
        });
        res.json({ message: "Property deleted successfully" });
    }
    catch (error) {
        console.error("Delete property error:", error);
        res.status(500).json({ error: "Failed to delete property" });
    }
};
exports.deleteProperty = deleteProperty;
// add property favorite
const favoriteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyId = Array.isArray(id) ? id[0] : id;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const property = await prisma_1.default.property.findFirst({
            where: { id: propertyId, deletedAt: null },
        });
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
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
        const favorite = await prisma_1.default.favorite.create({
            data: {
                userId,
                propertyId,
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
