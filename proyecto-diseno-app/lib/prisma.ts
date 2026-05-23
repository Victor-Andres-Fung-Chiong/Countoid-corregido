// lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Tomamos la variable de entorno
const connectionString = process.env.DATABASE_URL;

// Creamos la instancia del adaptador (Obligatorio en Prisma 7)
const adapter = new PrismaMssql(connectionString as string);

// Inicializamos el cliente de Prisma
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
    log: ['query'], // Opcional: Imprime las consultas en la terminal
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;