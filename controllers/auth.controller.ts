import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, organizationName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization if name is provided (for OWNER/ADMIN registration)
    let organizationId = null;

    if (organizationName && (role === "OWNER" || role === "ADMIN")) {
      const slug = organizationName.toLowerCase().replace(/\s+/g, "-");

      // Check if organization exists
      const existingOrg = await prisma.organization.findUnique({
        where: { slug },
      });

      if (existingOrg) {
        return res
          .status(409)
          .json({ error: "Organization name already taken" });
      }

      const organization = await prisma.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      });

      organizationId = organization.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || "USER",
        organizationId,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
