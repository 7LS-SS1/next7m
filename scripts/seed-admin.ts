/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.SEED_ADMIN_PASSWORD || Math.random().toString(36).slice(-12);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log('Admin already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(pass, 12);
  await prisma.user.create({ data: { email, passwordHash, role: 'ADMIN', name: 'Administrator' } });
  console.log('Admin created\nEmail:', email, '\nPassword:', pass);
}

main().finally(() => prisma.$disconnect());