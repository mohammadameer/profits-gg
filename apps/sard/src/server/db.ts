/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof initializePrisma>;
};

const initializePrisma = () => {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());
};

export const prisma = globalForPrisma.prisma ?? initializePrisma();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
