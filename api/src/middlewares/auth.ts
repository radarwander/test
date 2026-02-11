import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/auth';

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Unauthorized' });
  }
  try {
    req.user = verifyToken(auth.split(' ')[1]);
    next();
  } catch {
    next({ status: 401, message: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next({ status: 403, message: 'Forbidden' });
    }
    next();
  };
}
