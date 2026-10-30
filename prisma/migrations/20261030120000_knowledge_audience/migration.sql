-- CreateEnum
CREATE TYPE "KnowledgeAudience" AS ENUM ('PUBLIC', 'ADMIN');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "audience" "KnowledgeAudience" NOT NULL DEFAULT 'PUBLIC';
