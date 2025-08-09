import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { computeMatchesForUser, clearMatchesCache, scorePair } from '../services/matchingService';
import { prisma } from '../prisma';

const router = Router();

router.get('/recommendations', requireAuth, async (req, res) => {
  const limit = Math.min(20, Number(req.query.limit) || 10);
  const matches = await computeMatchesForUser(req.user!.id, limit);
  res.json(matches);
});

router.post('/recompute', requireAuth, async (req, res) => {
  clearMatchesCache();
  res.json({ ok: true });
});

router.get('/with/:id', requireAuth, async (req, res) => {
  const otherId = req.params.id;
  const me = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { profile: true } });
  const other = await prisma.user.findUnique({ where: { id: otherId }, include: { profile: true } });
  if (!me || !me.profile || !other || !other.profile) return res.status(404).json({ error: 'Profiles not found' });
  const score = scorePair(me as any, other as any);
  res.json({ score });
});

export default router;

