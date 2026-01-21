import { Request, Response } from "express";
import prisma from "../utils/prisma";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Add property to favorites
export const favoriteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if property exists and is not deleted
    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Check if already favorited
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

    // Create favorite
    const favorite = await prisma.favorite.create({
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
  } catch (error) {
    console.error("Favorite property error:", error);
    res.status(500).json({ error: "Failed to favorite property" });
  }
};

// Remove property from favorites
export const unfavoriteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the favorite
    const favorite = await prisma.favorite.findUnique({
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
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    res.json({ message: "Property removed from favorites" });
  } catch (error) {
    console.error("Unfavorite property error:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

// Get user's favorites
export const getUserFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      page = "1",
      limit = "10",
    } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
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
        take: parseInt(limit as string),
      }),
      prisma.favorite.count({
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
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

// Check if property is favorited by user
export const checkIsFavorited = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const pid = Array.isArray(propertyId) ? propertyId[0] : propertyId;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const favorite = await prisma.favorite.findUnique({
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
  } catch (error) {
    console.error("Check favorite error:", error);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
};

// Get favorite count for a property
export const getPropertyFavoriteCount = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const pid = Array.isArray(propertyId) ? propertyId[0] : propertyId;

    const count = await prisma.favorite.count({
      where: {
        propertyId: pid,
        property: {
          deletedAt: null,
        },
      },
    });

    res.json({ count });
  } catch (error) {
    console.error("Get favorite count error:", error);
    res.status(500).json({ error: "Failed to get favorite count" });
  }
};