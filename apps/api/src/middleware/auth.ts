import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../firebase';
import { env, isAdminEmail } from '../env';
import { prisma } from '../prisma';

export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __DEV_BYPASS_AUTH__: boolean | undefined;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    isAdmin?: boolean;
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Test/dev bypass for automated tests
    if (process.env.NODE_ENV === 'test') {
      const devUser = (req.headers['x-dev-user'] as string) || '';
      if (devUser) {
        const email = `${devUser}@ucsc.edu`;
        const domain = 'ucsc.edu';
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({ data: { email, emailDomain: domain, profileCompleted: false } });
        }
        req.user = { id: user.id, email: user.email };
        req.isAdmin = isAdminEmail(user.email);
        return next();
      }
    }
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    if (!token) return res.status(401).json({ error: 'Missing Authorization header' });
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    const email = decoded.email || '';
    const domain = email.split('@')[1];
    if (domain !== env.ALLOWED_EMAIL_DOMAIN) {
      return res.status(403).json({ error: 'Email domain not allowed' });
    }
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, emailDomain: domain, profileCompleted: false }
      });
    }
    req.user = { id: user.id, email: user.email };
    req.isAdmin = isAdminEmail(user.email);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin only' });
  next();
};

