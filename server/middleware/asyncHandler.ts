import type { Request, Response, NextFunction, RequestHandler } from 'express'

type Handler = (req: Request, res: Response, next: NextFunction) => unknown

export const asyncHandler = (handler: Handler): RequestHandler => (req, res, next) => {
  Promise.resolve().then(() => handler(req, res, next)).catch(next)
}
