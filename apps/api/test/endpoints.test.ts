import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';

const app = createApp();

const shouldRun = process.env.TEST_API_E2E === '1';

describe.skipIf(!shouldRun)('API endpoints (e2e)', () => {
  const testHeader = { 'x-dev-user': 'apitestuser' } as any;

  beforeAll(async () => {
    await prisma.message.deleteMany({});
    await prisma.thread.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: ['apitestuser@ucsc.edu', 'apitestother@ucsc.edu'] } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('PUT /me/profile creates profile and GET /me returns it', async () => {
    await request(app).put('/api/v1/me').set(testHeader).send({
      name: 'API Test User', age: 20, major: 'Computer Science', yearInSchool: 'JUNIOR'
    }).expect(200);

    await request(app).put('/api/v1/me/profile').set(testHeader).send({
      sleepSchedule: 'NORMAL', cleanliness: 3, noiseTolerance: 3, studyHabits: 'MIX', guests: 'SOMETIMES',
      p_introvertExtrovert: 3, p_structureSpontaneity: 3, p_morningNight: 3, smoking: false, petsOk: true, petAllergies: false
    }).expect(200);

    const me = await request(app).get('/api/v1/me').set(testHeader).expect(200);
    expect(me.body.profile.cleanliness).toBe(3);
  });

  it('GET /matches/recommendations returns matches', async () => {
    // ensure another user exists
    const other = await prisma.user.upsert({
      where: { email: 'apitestother@ucsc.edu' },
      update: {},
      create: {
        email: 'apitestother@ucsc.edu', emailDomain: 'ucsc.edu', name: 'Other', age: 21, major: 'Computer Science', yearInSchool: 'JUNIOR', profileCompleted: true,
        profile: {
          create: {
            sleepSchedule: 'NORMAL', cleanliness: 3, noiseTolerance: 3, studyHabits: 'MIX', guests: 'SOMETIMES',
            p_introvertExtrovert: 3, p_structureSpontaneity: 3, p_morningNight: 3, smoking: false, petsOk: true, petAllergies: false
          }
        }
      }
    });

    const res = await request(app).get('/api/v1/matches/recommendations?limit=10').set(testHeader).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

