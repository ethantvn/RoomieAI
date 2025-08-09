import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { profile: true }
  });
  if (!me) return res.status(404).json({ error: 'Not found' });
  const { email, ...rest } = me;
  res.json({ user: { ...rest, isAdmin: req.isAdmin }, profile: me.profile, profileCompleted: me.profileCompleted });
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(16).max(100).optional(),
  major: z.string().max(100).optional(),
  yearInSchool: z.enum(['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRAD']).optional()
});

router.put('/', requireAuth, async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: parsed.data });
  const { email, ...rest } = user;
  res.json(rest);
});

const profileSchema = z.object({
  sleepSchedule: z.enum(['EARLY', 'NORMAL', 'LATE']),
  cleanliness: z.number().int().min(1).max(5),
  noiseTolerance: z.number().int().min(1).max(5),
  studyHabits: z.enum(['LIBRARY', 'ROOM', 'MIX']),
  guests: z.enum(['RARE', 'SOMETIMES', 'OFTEN']),
  p_introvertExtrovert: z.number().int().min(1).max(5),
  p_structureSpontaneity: z.number().int().min(1).max(5),
  p_morningNight: z.number().int().min(1).max(5),
  specialRequests: z.string().optional(),
  smoking: z.boolean(),
  petsOk: z.boolean(),
  petAllergies: z.boolean()
});

router.get('/profile', requireAuth, async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.user!.id } });
  res.json(profile);
});

router.put('/profile', requireAuth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const upserted = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    update: data,
    create: { ...data, userId: req.user!.id }
  });
  await prisma.user.update({ where: { id: req.user!.id }, data: { profileCompleted: true } });
  res.json(upserted);
});

export default router;

