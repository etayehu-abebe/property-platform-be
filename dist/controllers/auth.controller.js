"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const register = async (req, res) => {
    try {
        const { email, password, name, role, organizationName } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create organization if name is provided (for OWNER/ADMIN registration)
        let organizationId = null;
        if (organizationName && (role === "OWNER" || role === "ADMIN")) {
            const slug = organizationName.toLowerCase().replace(/\s+/g, "-");
            // Check if organization exists
            const existingOrg = await prisma_1.default.organization.findUnique({
                where: { slug },
            });
            if (existingOrg) {
                return res
                    .status(409)
                    .json({ error: "Organization name already taken" });
            }
            const organization = await prisma_1.default.organization.create({
                data: {
                    name: organizationName,
                    slug,
                },
            });
            organizationId = organization.id;
        }
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                role: role || "USER",
                organizationId,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        }, process.env.JWT_SECRET, { expiresIn: "24h" });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { organization: true },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        }, process.env.JWT_SECRET, { expiresIn: "24h" });
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
exports.login = login;
