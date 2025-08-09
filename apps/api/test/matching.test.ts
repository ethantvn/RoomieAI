import { describe, it, expect } from 'vitest';
import { scorePair, WEIGHTS } from '../src/services/matchingService';

const baseUser = (overrides: any = {}) => ({
  id: 'u',
  emailDomain: 'ucsc.edu',
  createdAt: new Date(),
  updatedAt: new Date(),
  profileCompleted: true,
  profile: {
    sleepSchedule: 'NORMAL',
    cleanliness: 3,
    noiseTolerance: 3,
    studyHabits: 'LIBRARY',
    guests: 'SOMETIMES',
    p_introvertExtrovert: 3,
    p_structureSpontaneity: 3,
    p_morningNight: 3,
    smoking: false,
    petsOk: true,
    petAllergies: false,
    ...overrides.profile
  },
  ...overrides
});

describe('matching service', () => {
  it('dealbreakers zero score for smoking/pets conflicts', () => {
    const a = baseUser({ profile: { smoking: true, petsOk: false } });
    const b = baseUser({ profile: { smoking: false, petsOk: true } });
    const s = scorePair(a as any, b as any);
    expect(s.total).toBe(0);
  });

  it('perfect match gets high score', () => {
    const a = baseUser();
    const b = baseUser();
    const s = scorePair(a as any, b as any);
    expect(s.total).toBeGreaterThanOrEqual(80);
    expect(s.breakdown.lifestyle).toBeGreaterThanOrEqual(80);
  });
});

