# Property Platform Backend

This is a TypeScript-based REST API built with Express.js for a property listing and management platform.  
It provides authentication, property management, and favorites functionality, and is designed to work with a modern frontend (Next.js in my case).

## Tech Stack

This project uses the following technologies:

### Backend Framework
- ## Express.js ##  
  Chosen for its simplicity, flexibility, and wide ecosystem. Express allows fast development of REST APIs and integrates well with middleware such as authentication and CORS.

### Language
- ## TypeScript ##
  Used to provide static typing, better developer experience, and early error detection. This improves maintainability and scalability for larger codebases.

### Database & ORM
- ## PostgreSQL (Neon serverless cloud DB) ##  
  A robust, production-ready relational database suitable for structured data like users, properties, and relationships.
- ## Prisma ORM ##
  Chosen for its type-safe queries, excellent TypeScript integration, and easy schema migrations.

### Authentication & Security
- ## JWT (jsonwebtoken) ##  
  Used for stateless authentication and authorization.
- ## bcryptjs ##  
  Used to securely hash and verify user passwords.

### Configuration & Utilities
- ## dotenv ##
  Used to manage environment variables securely.
- ## cors ## 
  Enables secure cross-origin requests between the backend (Render) and frontend (Vercel).

### Development Tools
- ## ts-node – Run TypeScript directly in development  
- ## nodemon – Automatically restarts the server on file changes  

---

## Getting Started

First, install the dependencies:

```bash
npm install
