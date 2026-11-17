-- CreateTable
CREATE TABLE "doll_categories" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "doll_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doll_categories_slug_key" ON "doll_categories"("slug");

-- CreateTable
CREATE TABLE "dolls" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "measurementsFileName" TEXT,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "dolls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dolls" ADD CONSTRAINT "dolls_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "doll_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
