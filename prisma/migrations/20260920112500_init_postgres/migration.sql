-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Shirt" (
    "id" SERIAL NOT NULL,
    "shirtId" TEXT NOT NULL,
    "displayName" TEXT,
    "department" TEXT,
    "pageUrl" TEXT NOT NULL,
    "qrCodeSvg" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shirt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" SERIAL NOT NULL,
    "shirtId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorDepartment" TEXT,
    "memory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shirt_shirtId_key" ON "Shirt"("shirtId");

-- CreateIndex
CREATE INDEX "Shirt_createdAt_idx" ON "Shirt"("createdAt");

-- CreateIndex
CREATE INDEX "Shirt_displayName_idx" ON "Shirt"("displayName");

-- CreateIndex
CREATE INDEX "Shirt_department_idx" ON "Shirt"("department");

-- CreateIndex
CREATE INDEX "Memory_shirtId_createdAt_idx" ON "Memory"("shirtId", "createdAt");

-- CreateIndex
CREATE INDEX "Memory_createdAt_idx" ON "Memory"("createdAt");

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_shirtId_fkey" FOREIGN KEY ("shirtId") REFERENCES "Shirt"("shirtId") ON DELETE CASCADE ON UPDATE CASCADE;
