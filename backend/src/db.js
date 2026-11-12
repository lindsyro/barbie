import { PrismaClient } from "@prisma/client";

/**
 * Глобальный экземпляр PrismaClient
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export default prisma;
