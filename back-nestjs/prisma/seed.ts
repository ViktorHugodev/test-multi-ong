import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // Criar ONG 1
  const org1 = await prisma.organization.create({
    data: {
      name: 'Artesãos da Esperança',
      slug: 'artesaos-esperanca',
      email: 'contato@artesaosesperanca.org',
      description: 'Promovendo o artesanato local',
    },
  });

  // Criar usuário manager da ONG 1
  await prisma.user.create({
    data: {
      email: 'manager@artesaosesperanca.org',
      passwordHash,
      fullName: 'João Silva',
      role: 'ONG_MANAGER',
      organizationId: org1.id,
    },
  });

  // Criar produtos da ONG 1
  const categories = ['Artesanato', 'Decoração'];
  for (let i = 1; i <= 5; i++) {
    await prisma.product.create({
      data: {
        organizationId: org1.id,
        name: `Artesanato ${i}`,
        description: `Peça artesanal única feita à mão`,
        price: 25.90 + i * 10,
        category: categories[i % 2],
        stockQty: 10 + i,
        weightGrams: 200 + i * 50,
        sku: `ART-00${i}`,
      },
    });
  }

  // Criar ONG 2
  const org2 = await prisma.organization.create({
    data: {
      name: 'Doceria Solidária',
      slug: 'doceria-solidaria',
      email: 'contato@doceriasolidaria.org',
      description: 'Doces artesanais para uma boa causa',
    },
  });

  // Criar usuário manager da ONG 2
  await prisma.user.create({
    data: {
      email: 'manager@doceriasolidaria.org',
      passwordHash,
      fullName: 'Maria Santos',
      role: 'ONG_MANAGER',
      organizationId: org2.id,
    },
  });

  // Criar produtos da ONG 2
  const doceCategories = ['Doces', 'Alimentos'];
  for (let i = 1; i <= 5; i++) {
    await prisma.product.create({
      data: {
        organizationId: org2.id,
        name: `Doce ${i}`,
        description: `Doce artesanal delicioso`,
        price: 15.90 + i * 5,
        category: doceCategories[i % 2],
        stockQty: 20 + i,
        weightGrams: 150 + i * 30,
        sku: `DOC-00${i}`,
      },
    });
  }

  // Criar usuário customer
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash,
      fullName: 'Cliente Teste',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });