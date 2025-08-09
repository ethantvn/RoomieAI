import { PrismaClient, YearInSchool, SleepSchedule, StudyHabits, Guests } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const majors = [
  'Computer Science',
  'Electrical Engineering',
  'Biology',
  'Economics',
  'Psychology',
  'Mathematics',
  'Physics',
  'History',
  'Philosophy'
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('Seeding users...');
  const users = [] as { id: string }[];
  for (let i = 0; i < 500; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const email = `${first}.${last}.${i}@ucsc.edu`.toLowerCase();
    const baseData = {
      email,
      emailDomain: 'ucsc.edu',
      name: `${first} ${last}`,
      age: faker.number.int({ min: 18, max: 28 }),
      major: pick(majors),
      yearInSchool: pick([
        YearInSchool.FRESHMAN,
        YearInSchool.SOPHOMORE,
        YearInSchool.JUNIOR,
        YearInSchool.SENIOR,
        YearInSchool.GRAD
      ]),
      profileCompleted: true
    };
    const user = await prisma.user.upsert({
      where: { email },
      update: baseData,
      create: baseData
    });
    users.push({ id: user.id });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        sleepSchedule: pick([SleepSchedule.EARLY, SleepSchedule.NORMAL, SleepSchedule.LATE]),
        cleanliness: faker.number.int({ min: 1, max: 5 }),
        noiseTolerance: faker.number.int({ min: 1, max: 5 }),
        studyHabits: pick([StudyHabits.LIBRARY, StudyHabits.ROOM, StudyHabits.MIX]),
        guests: pick([Guests.RARE, Guests.SOMETIMES, Guests.OFTEN]),
        p_introvertExtrovert: faker.number.int({ min: 1, max: 5 }),
        p_structureSpontaneity: faker.number.int({ min: 1, max: 5 }),
        p_morningNight: faker.number.int({ min: 1, max: 5 }),
        smoking: faker.datatype.boolean({ probability: 0.2 }),
        petsOk: faker.datatype.boolean({ probability: 0.6 }),
        petAllergies: faker.datatype.boolean({ probability: 0.15 }),
        specialRequests: faker.lorem.sentence()
      },
      create: {
        userId: user.id,
        sleepSchedule: pick([SleepSchedule.EARLY, SleepSchedule.NORMAL, SleepSchedule.LATE]),
        cleanliness: faker.number.int({ min: 1, max: 5 }),
        noiseTolerance: faker.number.int({ min: 1, max: 5 }),
        studyHabits: pick([StudyHabits.LIBRARY, StudyHabits.ROOM, StudyHabits.MIX]),
        guests: pick([Guests.RARE, Guests.SOMETIMES, Guests.OFTEN]),
        p_introvertExtrovert: faker.number.int({ min: 1, max: 5 }),
        p_structureSpontaneity: faker.number.int({ min: 1, max: 5 }),
        p_morningNight: faker.number.int({ min: 1, max: 5 }),
        smoking: faker.datatype.boolean({ probability: 0.2 }),
        petsOk: faker.datatype.boolean({ probability: 0.6 }),
        petAllergies: faker.datatype.boolean({ probability: 0.15 }),
        specialRequests: faker.lorem.sentence()
      }
    });
  }

  // Create some obvious great matches (similar profiles)
  const a = await prisma.user.upsert({
    where: { email: 'great.match1@ucsc.edu' },
    update: {
      name: 'Great Match 1', age: 20, major: 'Computer Science', yearInSchool: YearInSchool.JUNIOR, profileCompleted: true
    },
    create: {
      email: 'great.match1@ucsc.edu', emailDomain: 'ucsc.edu', name: 'Great Match 1', age: 20, major: 'Computer Science', yearInSchool: YearInSchool.JUNIOR, profileCompleted: true
    }
  });
  await prisma.profile.upsert({
    where: { userId: a.id },
    update: {
      sleepSchedule: SleepSchedule.NORMAL,
      cleanliness: 5,
      noiseTolerance: 4,
      studyHabits: StudyHabits.LIBRARY,
      guests: Guests.RARE,
      p_introvertExtrovert: 4,
      p_structureSpontaneity: 4,
      p_morningNight: 4,
      smoking: false,
      petsOk: true,
      petAllergies: false,
      specialRequests: 'Looking for a focused roommate'
    },
    create: {
      userId: a.id,
      sleepSchedule: SleepSchedule.NORMAL,
      cleanliness: 5,
      noiseTolerance: 4,
      studyHabits: StudyHabits.LIBRARY,
      guests: Guests.RARE,
      p_introvertExtrovert: 4,
      p_structureSpontaneity: 4,
      p_morningNight: 4,
      smoking: false,
      petsOk: true,
      petAllergies: false,
      specialRequests: 'Looking for a focused roommate'
    }
  });
  const b = await prisma.user.upsert({
    where: { email: 'great.match2@ucsc.edu' },
    update: {
      name: 'Great Match 2', age: 21, major: 'Computer Science', yearInSchool: YearInSchool.JUNIOR, profileCompleted: true
    },
    create: {
      email: 'great.match2@ucsc.edu', emailDomain: 'ucsc.edu', name: 'Great Match 2', age: 21, major: 'Computer Science', yearInSchool: YearInSchool.JUNIOR, profileCompleted: true
    }
  });
  await prisma.profile.upsert({
    where: { userId: b.id },
    update: {
      sleepSchedule: SleepSchedule.NORMAL,
      cleanliness: 5,
      noiseTolerance: 4,
      studyHabits: StudyHabits.LIBRARY,
      guests: Guests.RARE,
      p_introvertExtrovert: 4,
      p_structureSpontaneity: 4,
      p_morningNight: 4,
      smoking: false,
      petsOk: true,
      petAllergies: false,
      specialRequests: 'Love quiet study sessions'
    },
    create: {
      userId: b.id,
      sleepSchedule: SleepSchedule.NORMAL,
      cleanliness: 5,
      noiseTolerance: 4,
      studyHabits: StudyHabits.LIBRARY,
      guests: Guests.RARE,
      p_introvertExtrovert: 4,
      p_structureSpontaneity: 4,
      p_morningNight: 4,
      smoking: false,
      petsOk: true,
      petAllergies: false,
      specialRequests: 'Love quiet study sessions'
    }
  });

  console.log('Creating threads and messages...');
  for (let i = 0; i < 20; i++) {
    const u1 = pick(users).id;
    let u2 = pick(users).id;
    if (u1 === u2) u2 = pick(users).id;
    const [p1, p2] = u1 < u2 ? [u1, u2] : [u2, u1];
    const thread = await prisma.thread.upsert({
      where: { participantAId_participantBId: { participantAId: p1, participantBId: p2 } },
      update: {},
      create: { participantAId: p1, participantBId: p2 }
    });
    const messagesCount = faker.number.int({ min: 2, max: 10 });
    for (let m = 0; m < messagesCount; m++) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          senderId: m % 2 === 0 ? u1 : u2,
          body: faker.lorem.sentence()
        }
      });
    }
    await prisma.thread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() }
    });
  }

  console.log('Seed complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

