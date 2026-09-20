-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "department" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Shirt" ADD COLUMN "ownerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");
CREATE UNIQUE INDEX "Shirt_ownerId_key" ON "Shirt"("ownerId");

-- AddForeignKey
ALTER TABLE "Shirt" ADD CONSTRAINT "Shirt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
