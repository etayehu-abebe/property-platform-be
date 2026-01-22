import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
        email: string
        name?: string
        organizationId?: string
      }
    }
  }
}

export {} 