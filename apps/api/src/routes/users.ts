import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true }
  });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const { email, ...publicUser } = user;
  res.json(publicUser);
});

export default router;

