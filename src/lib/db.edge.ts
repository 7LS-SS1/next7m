// src/lib/db.edge.ts
// ใช้เฉพาะเมื่อ runtime = 'edge' จริงๆ
import { PrismaClient } from '@prisma/client/edge'

let prisma: PrismaClient
// edge ไม่มี global caching แบบเดียวกับ Node — สร้างใหม่เมื่อจำเป็น
prisma = new PrismaClient()

export { prisma }