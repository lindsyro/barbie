-- CreateTable
CREATE TABLE "menu_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "target" TEXT NOT NULL DEFAULT '_self',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
