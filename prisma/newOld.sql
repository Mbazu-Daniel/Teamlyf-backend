// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Administration 

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  organizations Organization[]
  employees     Employee[]
  teams         Team[]
  invite        Invite[]
  folders       Folder[]
  projects      Project[]
  createdBy     Task[]         @relation("CreatedBy")
  collaborators Task[]         @relation("Collaborators")
  subtasks      SubTask[]

  taskComments TaskComment[]
  taskHistory  TaskHistory[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

// workspace
model Organization {
  id         String  @id @default(cuid())
  name       String  @unique
  logo       String?
  address    String?
  inviteCode String  @unique

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  employees Employee[]
  teams     Team[]
  invite    Invite[]
  folders   Folder[]
  tasks     Task[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, name])
}

enum EmployeeRole {
  OWNER
  ADMIN
  MEMBER
  GUEST
}

model Employee {
  id            String    @id @default(cuid())
  fullName      String?
  displayName   String?
  email         String?
  birthDate     DateTime?
  gender        String?
  contactNumber String?
  address       String?
  image         String?
  salary        Float?

  role   EmployeeRole @default(MEMBER)
  userId String
  user   User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, organizationId])
}

enum TeamType {
  TEXT
  AUDIO
  VIDEO
}

// Team or Department
model Team {
  id     String   @id @default(cuid())
  name   String   @unique
  alias  String?
  type   TeamType @default(TEXT)
  userId String
  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, organizationId, name])
}

// Group / channel
// model Group {

// }
model Invite {
  id             String       @id @default(uuid())
  token          String
  email          String
  role           EmployeeRole @default(MEMBER)
  expirationDate DateTime

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("Invite")
}

// Project Management 

// subspace
model Folder {
  id     String  @id @default(cuid())
  title  String
  avatar String?

  tasks    Task[]
  projects Project[]

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  userId  String
  creator User   @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Todo: Add Employee to model 
// Todo: Add Team to this model ?
// Todo: isFavourite boolean, start and Due date, thumbnails, attachments, priority

// Todo: client representative, assign PM, assign members

model Project {
  id          String  @id @default(cuid())
  name        String
  description String?

  tasks Task[]

  folderId String
  folders  Folder @relation(fields: [folderId], references: [id], onDelete: Cascade)

  userId String
  creator   User   @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Priority {
  LOW
  NORMAL
  HIGH
}

enum Status {
  TODO
  IN_PROGRESS
  COMPLETED
}

model Task {
  id            String    @id @default(cuid())
  title         String
  description   String?
  labels        String[]
  isCompleted   Boolean   @default(false) // move to project side
  notifications Boolean   @default(true)
  startDate     DateTime  @default(now())
  endDate       DateTime?
  reminderDate  DateTime?

  subtasks     SubTask[]
  taskComments TaskComment[]
  taskHistory  TaskHistory[]

  userId String
  user   User   @relation("CreatedBy", fields: [userId], references: [id], onDelete: Cascade)

  collaboratorsId String[]
  collaborators   User?    @relation("Collaborators", fields: [collaboratorsId], references: [id], onDelete: Cascade)

  folderId String?
  folders  Folder? @relation(fields: [folderId], references: [id], onDelete: Cascade)

  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  status   Status   @default(TODO)
  priority Priority @default(NORMAL)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SubTask {
  id    String @id @default(cuid())
  title String

  startDate DateTime
  endDate   DateTime

  userId    String?
  assignees User?   @relation(fields: [userId], references: [id])

  taskId String?
  tasks  Task?   @relation(fields: [taskId], references: [id])

  status   Status   @default(TODO)
  priority Priority @default(NORMAL)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TaskComment {
  id   String @id @default(cuid())
  text String

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  taskId String
  tasks  Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum TaskAction {
  ADDED_TASKS
  UPDATED_TASKS
  DELETED_TASKS
  COMPLETED_TASKS
  UNCOMPLETED_TASKS
  ADDED_COMMENTS
  UPDATED_COMMENTS
  DELETED_COMMENTS
  COLLABORATOR_ADDED
  COLLABORATOR_DELETED
}

model TaskHistory {
  id     String     @id @default(cuid())
  action TaskAction

  taskId String?
  tasks  Task?   @relation(fields: [taskId], references: [id], onDelete: Cascade)

  userId String?
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
