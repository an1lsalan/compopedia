-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "data" BYTEA,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TextBlock" ADD COLUMN     "blockType" TEXT NOT NULL DEFAULT 'code',
ADD COLUMN     "headline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'javascript';
