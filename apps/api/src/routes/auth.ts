import { Router } from 'express';
import { z } from 'zod';
import { firebaseAdmin } from '../firebase';
import { prisma } from '../prisma';
import { env } from '../env';

const router = Router();

const sessionSchema = z.object({ idToken: z.string() });

router.post('/session', async (req, res) => {
  const parsed = sessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { idToken } = parsed.data;
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
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
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return res.json({ user: { ...user, email: undefined }, profile });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

