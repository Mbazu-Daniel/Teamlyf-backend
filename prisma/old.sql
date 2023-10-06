// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  organizations Organization[]
  invites       Invite[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  Employee      Employee?      @relation(fields: [employeeId], references: [id])
  employeeId    String?

  @@map("User")
}

model Organization {
  id          String     @id @default(uuid())
  name        String     @unique
  address     String?
  logo        String?
  employees   Employee[] // Employees of the organization
  owner       User       @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdById String // Add the createdById field
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  invites     Invite[] // Invites related to the organization
  Team        Team[]

  @@map("Organization")
}

model Employee {
  id             String       @id @default(uuid())
  fullName       String?
  displayName    String?
  email          String
  birthDate      DateTime?
  gender         String?
  contactNumber  String?
  address        String?
  image          String?
  salary         Float?
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  role           String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  User           User[]
  Team           Team?        @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId         String?

  @@map("Employee")
}

model Invite {
  id             String        @id @default(uuid())
  token          String
  email          String
  role           String
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String?
  expirationDate DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  User           User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String?

  @@map("Invite")
}

// Team Model
model Team {
  id             String        @id @default(uuid())
  name           String
  createdById    String
  employees      Employee[]
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@map("Team")
}

// Space Model
// model Space {
//   id           String     @id @default(uuid())
//   title        String
//   projects     Project[]
//   tasks        Task[]
//   organization Organization @relation(fields: [organizationId], references: [id])
//   organizationId String    @map("organization")
//   createdBy     Employee   @relation(fields: [createdById], references: [id])
//   createdById   String     @map("createdBy")
//   createdAt     DateTime   @default(now())
//   updatedAt     DateTime   @updatedAt
//   @@map("Space")
// }

// Project Model
// model Project {
//   id          String     @id @default(uuid())
//   title       String
//   description String?
//   tasks       Task[]
//   space       Space      @relation(fields: [spaceId], references: [id])
//   spaceId     String     @map("space")
//   createdBy   Employee   @relation(fields: [createdById], references: [id])
//   createdById String     @map("createdBy")
//   createdAt   DateTime   @default(now())
//   updatedAt   DateTime   @updatedAt
//   @@map("Project")
// }

// Task Model
// model Task {
//   id          String     @id @default(uuid())
//   title       String
//   description String?
//   priority    String     @default("normal")
//   status      String     @default("pending")
//   tags        String[]
//   projects    Project[]  @relation(fields: [projectId], references: [id])
//   projectId   String     @map("projects")
//   assignees   Employee[] @relation(fields: [assigneeId], references: [id])
//   assigneeId  String     @map("assignees")
//   taskComments    TaskComment[]
//   isCompleted Boolean    @default(false)
//   startDate   DateTime?
//   dueDate     DateTime?
//   createdBy   Employee   @relation(fields: [createdById], references: [id])
//   createdById String     @map("createdBy")
//   createdAt   DateTime   @default(now())
//   updatedAt   DateTime   @updatedAt
//   @@map("Task")
// }

// // TaskComment Model (if not already defined)
// model TaskComment {
//   id        String   @id @default(uuid())
//   content   String
//   taskId    String   @map("task")
//   task      Task     @relation(fields: [taskId], references: [id])
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   @@map("TaskComment")
// }
