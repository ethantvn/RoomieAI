import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const threads = await prisma.thread.findMany({
    where: {
      OR: [{ participantAId: req.user!.id }, { participantBId: req.user!.id }]
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      messages: { take: 1, orderBy: { createdAt: 'desc' } },
      participantA: true,
      participantB: true
    }
  });
  res.json(
    threads.map((t) => ({
      id: t.id,
      lastMessageAt: t.lastMessageAt,
      lastMessage: t.messages[0] || null,
      otherParticipant:
        t.participantAId === req.user!.id
          ? { id: t.participantB.id, name: t.participantB.name, major: t.participantB.major, yearInSchool: t.participantB.yearInSchool }
          : { id: t.participantA.id, name: t.participantA.name, major: t.participantA.major, yearInSchool: t.participantA.yearInSchool }
    }))
  );
});

const createThreadSchema = z.object({ participantId: z.string() });

router.post('/', requireAuth, async (req, res) => {
  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { participantId } = parsed.data;
  const a = req.user!.id;
  const b = participantId;
  const [p1, p2] = a < b ? [a, b] : [b, a];
  const existing = await prisma.thread.findUnique({
    where: { participantAId_participantBId: { participantAId: p1, participantBId: p2 } }
  });
  if (existing) return res.json(existing);
  const created = await prisma.thread.create({ data: { participantAId: p1, participantBId: p2 } });
  res.status(201).json(created);
});

router.get('/:id/messages', requireAuth, async (req, res) => {
  const { id } = req.params;
  const cursor = req.query.cursor as string | undefined;
  const take = 30;
  const messages = await prisma.message.findMany({
    where: { threadId: id },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
  });
  const nextCursor = messages.length === take ? messages[messages.length - 1].id : undefined;
  res.json({ messages: messages.reverse(), nextCursor });
});

const messageLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60 });
const createMessageSchema = z.object({ body: z.string().min(1).max(2000) });

router.post('/:id/messages', requireAuth, messageLimiter, async (req, res) => {
  const { id } = req.params;
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  if (![thread.participantAId, thread.participantBId].includes(req.user!.id))
    return res.status(403).json({ error: 'Not a participant' });
  const msg = await prisma.message.create({
    data: { threadId: id, senderId: req.user!.id, body: parsed.data.body }
  });
  await prisma.thread.update({ where: { id }, data: { lastMessageAt: msg.createdAt } });
  res.status(201).json(msg);
});

export default router;

