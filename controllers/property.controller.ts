import { Request, Response } from "express";
import prisma from "../utils/prisma";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, price, images } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const property = await prisma.property.create({
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
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
      minPrice,
      maxPrice,
      location,
    } = req.query;

    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (location)
      where.location = { contains: location as string, mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: { owner: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const publishProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // FIX: Ensure id is string, not array
    const propertyId = Array.isArray(id) ? id[0] : id;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const property = await prisma.property.findUnique({
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

    if (
      !property.title ||
      !property.description ||
      !property.location ||
      !property.price ||
      property.images.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Property missing required fields for publishing" });
    }

    const updatedProperty = await prisma.$transaction(async (tx: any) => {
      return await tx.property.update({
        where: { id: propertyId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error("Publish property error:", error);
    res.status(500).json({ error: "Failed to publish property" });
  }
};

// Add missing basic CRUD operations
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;

    const property = await prisma.property.findUnique({
      where: { id: propertyId, deletedAt: null },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;
    const userId = req.user?.userId;
    const { title, description, location, price, images } = req.body;

    const property = await prisma.property.findUnique({
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

    const updatedProperty = await prisma.property.update({
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
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const property = await prisma.property.findUnique({
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
    await prisma.property.update({
      where: { id: propertyId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
};

// add property favorite
export const favoriteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const existingFavorite = await prisma.favorite.findUnique({
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

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error("Favorite property error:", error);
    res.status(500).json({ error: "Failed to favorite property" });
  }
};
