import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/metrics/overview', requireAuth, requireAdmin, async (_req, res) => {
  const [totalUsers, completedProfiles, avgCompatibility] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { profileCompleted: true } }),
    prisma.matchScore.aggregate({ _avg: { score: true }, where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } })
  ]);
  res.json({ totalUsers, completedProfiles, avgCompatibility: avgCompatibility._avg.score || 0 });
});

router.get('/reports/compatibility', requireAuth, requireAdmin, async (_req, res) => {
  // Histogram buckets of scores in last 30 days
  const recent = await prisma.matchScore.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { score: true }
  });
  const buckets = [0, 20, 40, 60, 80, 100].map((start, i, arr) => {
    const end = arr[i + 1] ?? 100;
    const count = recent.filter((r) => r.score >= start && r.score < end).length;
    return { range: `${start}-${end - 1}`, count };
  });
  res.json({ buckets });
});

export default router;

