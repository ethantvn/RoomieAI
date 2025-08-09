-- CreateEnum
CREATE TYPE "YearInSchool" AS ENUM ('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRAD');

-- CreateEnum
CREATE TYPE "SleepSchedule" AS ENUM ('EARLY', 'NORMAL', 'LATE');

-- CreateEnum
CREATE TYPE "StudyHabits" AS ENUM ('LIBRARY', 'ROOM', 'MIX');

-- CreateEnum
CREATE TYPE "Guests" AS ENUM ('RARE', 'SOMETIMES', 'OFTEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailDomain" TEXT NOT NULL,
    "name" TEXT,
    "age" INTEGER,
    "major" TEXT,
    "yearInSchool" "YearInSchool",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sleepSchedule" "SleepSchedule" NOT NULL,
    "cleanliness" INTEGER NOT NULL,
    "noiseTolerance" INTEGER NOT NULL,
    "studyHabits" "StudyHabits" NOT NULL,
    "guests" "Guests" NOT NULL,
    "p_introvertExtrovert" INTEGER NOT NULL,
    "p_structureSpontaneity" INTEGER NOT NULL,
    "p_morningNight" INTEGER NOT NULL,
    "specialRequests" TEXT,
    "smoking" BOOLEAN NOT NULL,
    "petsOk" BOOLEAN NOT NULL,
    "petAllergies" BOOLEAN NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "participantAId" TEXT NOT NULL,
    "participantBId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMetricSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "completedProfiles" INTEGER NOT NULL,
    "avgCompatibility" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AdminMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "MatchScore_userAId_idx" ON "MatchScore"("userAId");

-- CreateIndex
CREATE INDEX "MatchScore_userBId_idx" ON "MatchScore"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_userAId_userBId_key" ON "MatchScore"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Thread_lastMessageAt_idx" ON "Thread"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "Thread_participantAId_participantBId_key" ON "Thread"("participantAId", "participantBId");

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminMetricSnapshot_date_key" ON "AdminMetricSnapshot"("date");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_participantAId_fkey" FOREIGN KEY ("participantAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_participantBId_fkey" FOREIGN KEY ("participantBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
