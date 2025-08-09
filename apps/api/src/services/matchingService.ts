import { Prisma, Profile, User, YearInSchool } from '@prisma/client';
import { prisma } from '../prisma';

export const WEIGHTS = {
  lifestyle: 0.4,
  personality: 0.4,
  extras: 0.2
};

export const DEALBREAKERS = { smoking: true, pets: true } as const;

type ScoreBreakdown = {
  lifestyle: number;
  personality: number;
  extras: number;
  details: Record<string, number>;
};

const cache = new Map<string, { expiresAt: number; matches: Array<any> }>();
export function clearMatchesCache() {
  cache.clear();
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const distanceScore = (a: number, b: number, maxDistance: number) => {
  const d = Math.abs(a - b);
  return clamp01(1 - d / maxDistance);
};

const yearDistance = (a?: YearInSchool | null, b?: YearInSchool | null) => {
  if (!a || !b) return 0.5; // neutral if unknown
  const order = ['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRAD'] as const;
  const da = order.indexOf(a as any);
  const db = order.indexOf(b as any);
  const diff = Math.abs(da - db);
  if (diff === 0) return 1;
  if (diff === 1) return 0.75;
  if (diff === 2) return 0.5;
  return 0.25;
};

const majorSimilarity = (a?: string | null, b?: string | null) => {
  if (!a || !b) return 0.5;
  if (a.toLowerCase() === b.toLowerCase()) return 1;
  // simple heuristic: same division keywords
  const divisions: Record<string, string[]> = {
    engineering: ['computer', 'electrical', 'computer science', 'bioengineering', 'mechanical'],
    sciences: ['biology', 'chemistry', 'physics', 'math', 'mathematics'],
    humanities: ['history', 'philosophy', 'literature', 'language'],
    social: ['economics', 'psychology', 'sociology', 'politics']
  };
  const findDiv = (m: string) =>
    (Object.entries(divisions).find(([_, list]) => list.some((kw) => m.toLowerCase().includes(kw)))?.[0]) || '';
  return findDiv(a) && findDiv(a) === findDiv(b) ? 0.7 : 0.4;
};

export async function computeMatchesForUser(userId: string, limit = 10) {
  const cacheKey = `${userId}:${limit}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.matches;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });
  if (!me || !me.profile) return [];

  const candidates = await prisma.user.findMany({
    where: { id: { not: userId }, profile: { isNot: null } },
    include: { profile: true }
  });

  const results = candidates
    .map((u) => ({
      user: u,
      score: scorePair(me, u)
    }))
    .filter((r) => r.score.total > 0) // drop zeroed by dealbreakers
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit)
    .map((r) => ({
      user: sanitizeUser(r.user),
      score: r.score
    }));

  // Persist top matches lazily for admin analytics
  try {
    await Promise.all(
      results.map((r) =>
        prisma.matchScore.upsert({
          where: {
            userAId_userBId: { userAId: userId, userBId: (r.user as any).id }
          },
          create: { userAId: userId, userBId: (r.user as any).id, score: r.score.total, details: r.score.breakdown },
          update: { score: r.score.total, details: r.score.breakdown }
        })
      )
    );
  } catch (e) {
    // ignore
  }

  cache.set(cacheKey, { matches: results, expiresAt: now + 24 * 60 * 60 * 1000 });
  return results;
}

function sanitizeUser(u: User & { profile: Profile | null }) {
  // remove email for public exposure
  const { email, ...rest } = u;
  return { ...rest };
}

export function scorePair(a: User & { profile: Profile }, b: User & { profile: Profile }) {
  // dealbreakers
  if (DEALBREAKERS.smoking && a.profile.smoking && !b.profile.smoking) {
    // Clarification: if user sets no smoking? We interpret smoking=true means the user smokes. If other disallows? For MVP, if either has smoking=true and the other would not accept -> drop.
  }

  // Implement dealbreakers from perspective of both users
  const violatesSmoking =
    (a.profile.smoking && !b.profile.smoking) || (b.profile.smoking && !a.profile.smoking);

  const petsConflict =
    (a.profile.petAllergies && b.profile.petsOk) ||
    (b.profile.petAllergies && a.profile.petsOk) ||
    (!a.profile.petsOk && b.profile.petsOk) ||
    (!b.profile.petsOk && a.profile.petsOk);

  if (violatesSmoking || petsConflict) {
    return { total: 0, breakdown: { lifestyle: 0, personality: 0, extras: 0, details: {} as any } };
  }

  // Lifestyle
  const sleep = a.profile.sleepSchedule === b.profile.sleepSchedule ? 1 : 0;
  const cleanliness = distanceScore(a.profile.cleanliness, b.profile.cleanliness, 4);
  const noise = distanceScore(a.profile.noiseTolerance, b.profile.noiseTolerance, 4);
  const study = a.profile.studyHabits === b.profile.studyHabits ? 1 : 0;
  const guests = a.profile.guests === b.profile.guests ? 1 : 0;
  const lifestyleRaw = 0.25 * sleep + 0.25 * cleanliness + 0.25 * noise + 0.125 * study + 0.125 * guests;

  // Personality
  const p1 = distanceScore(a.profile.p_introvertExtrovert, b.profile.p_introvertExtrovert, 4);
  const p2 = distanceScore(a.profile.p_structureSpontaneity, b.profile.p_structureSpontaneity, 4);
  const p3 = distanceScore(a.profile.p_morningNight, b.profile.p_morningNight, 4);
  const personalityRaw = (p1 + p2 + p3) / 3;

  // Extras
  const year = yearDistance(a.yearInSchool, b.yearInSchool);
  const major = majorSimilarity(a.major ?? undefined, b.major ?? undefined);
  const extrasRaw = 0.6 * year + 0.4 * major;

  const lifestyle = WEIGHTS.lifestyle * lifestyleRaw;
  const personality = WEIGHTS.personality * personalityRaw;
  const extras = WEIGHTS.extras * extrasRaw;
  const total01 = clamp01(lifestyle + personality + extras);
  const total = Math.round(total01 * 100);

  const breakdown: ScoreBreakdown = {
    lifestyle: Math.round(lifestyleRaw * 100),
    personality: Math.round(personalityRaw * 100),
    extras: Math.round(extrasRaw * 100),
    details: {
      sleep: Math.round(sleep * 100),
      cleanliness: Math.round(cleanliness * 100),
      noise: Math.round(noise * 100),
      study: Math.round(study * 100),
      guests: Math.round(guests * 100),
      p_introvertExtrovert: Math.round(p1 * 100),
      p_structureSpontaneity: Math.round(p2 * 100),
      p_morningNight: Math.round(p3 * 100),
      year: Math.round(year * 100),
      major: Math.round(major * 100)
    }
  };

  return { total, breakdown };
}

