-- CreateTable
CREATE TABLE "dolls" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "measurementsFileName" TEXT,

    CONSTRAINT "dolls_pkey" PRIMARY KEY ("id")
);
