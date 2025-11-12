// prisma/seed.ts
// Seed completo e realista para testes
// Executar com: npx prisma db seed

import { PrismaClient, UserRole, OrderStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpando dados existentes para evitar duplicações
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.searchLog.deleteMany();

  // ============================================
  // 1. Criar Organizações (ONGs)
  // ============================================

  const organizations = await prisma.organization.createMany({
    data: [
      {
        name: "Ampara Animais",
        slug: "ampara-animais",
        description: "ONG de proteção animal",
        email: "contato@amparaanimais.org",
        phone: "11987654321",
        logoUrl: faker.image.urlLoremFlickr({ category: "animal" }),
      },
      {
        name: "Casa do Bem",
        slug: "casa-do-bem",
        description: "Assistência social para famílias carentes",
        email: "contato@casadobem.org",
        phone: "11911112222",
        logoUrl: faker.image.urlLoremFlickr({ category: "people" }),
      },
      {
        name: "Vida Verde",
        slug: "vida-verde",
        description: "Preservação ambiental e reflorestamento",
        email: "contato@vidaverde.org",
        phone: "11955554444",
        logoUrl: faker.image.urlLoremFlickr({ category: "nature" }),
      },
      {
        name: "Sorriso Feliz",
        slug: "sorriso-feliz",
        description: "Campanhas odontológicas gratuitas",
        email: "contato@sorrisofeliz.org",
        phone: "11944443333",
        logoUrl: faker.image.urlLoremFlickr({ category: "health" }),
      },
      {
        name: "Café Solidário",
        slug: "cafe-solidario",
        description: "Distribuição de alimentos em regiões vulneráveis",
        email: "contato@cafesolidario.org",
        phone: "11922223333",
        logoUrl: faker.image.urlLoremFlickr({ category: "food" }),
      },
    ],
  });

  const orgs = await prisma.organization.findMany();

  // ============================================
  // 2. Criar Usuários
  // ============================================

  const passwordHash = "$2b$10$abcdefghijklmnopqrstuv"; // fake hash para testes

  const usersData: Array<{
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    organizationId: string | null;
  }> = [];

  for (const org of orgs) {
    // Criar manager
    usersData.push({
      email: `manager@${org.slug}.org`,
      passwordHash,
      fullName: `${org.name} Manager`,
      role: UserRole.ong_manager,
      organizationId: org.id,
    });

    // Criar staff
    for (let i = 0; i < 3; i++) {
      usersData.push({
        email: faker.internet.email(),
        passwordHash,
        fullName: faker.person.fullName(),
        role: UserRole.ong_staff,
        organizationId: org.id,
      });
    }

    // Criar clientes
    for (let i = 0; i < 10; i++) {
      usersData.push({
        email: faker.internet.email(),
        passwordHash,
        fullName: faker.person.fullName(),
        role: UserRole.customer,
        organizationId: org.id,
      });
    }
  }

  // Admin global
  usersData.push({
    email: "admin@sistema.com",
    passwordHash,
    fullName: "Admin Geral",
    role: UserRole.admin,
    organizationId: null,
  });

  await prisma.user.createMany({ data: usersData });
  const users = await prisma.user.findMany();

  // ============================================
  // 3. Criar Produtos
  // ============================================

  const productsData: Array<{
    organizationId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stockQty: number;
    weightGrams: number;
    sku: string;
  }> = [];

  for (const org of orgs) {
    const categories = ["Food", "Clothes", "Toys", "Medicine", "Misc"];

    for (let i = 0; i < 25; i++) {
      const price = Number(faker.finance.amount({ min: 5, max: 250, dec: 2 }));

      productsData.push({
        organizationId: org.id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price,
        category: faker.helpers.arrayElement(categories),
        imageUrl: faker.image.urlLoremFlickr(),
        stockQty: faker.number.int({ min: 0, max: 200 }),
        weightGrams: faker.number.int({ min: 50, max: 5000 }),
        sku: faker.string.alphanumeric(8).toUpperCase(),
      });
    }
  }

  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany();

  // ============================================
  // 4. Criar Pedidos + Itens de Pedido
  // ============================================

  for (let i = 0; i < 200; i++) {
    const customer = faker.helpers.arrayElement(users.filter(u => u.role === "customer"));
    const org = orgs.find(o => o.id === customer.organizationId)!;
    const productSample = faker.helpers.arrayElements(
      products.filter(p => p.organizationId === org.id),
      faker.number.int({ min: 1, max: 5 })
    );

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${faker.string.numeric(8)}`,
        customerId: customer.id,
        status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        paymentMethod: faker.helpers.arrayElement(["pix", "credit_card", "debit_card", "boleto"]),
        shippingCost: faker.finance.amount({ min: 0, max: 40, dec: 2 }),
        totalAmount: 0,
      },
    });

    let total = 0;

    for (const p of productSample) {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const subtotal = Number(p.price) * quantity;
      total += subtotal;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: p.id,
          organizationId: org.id,
          productName: p.name,
          productPrice: p.price,
          quantity,
          subtotal,
          weightGrams: p.weightGrams,
        },
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount: total },
    });
  }

  // ============================================
  // 5. Criar Logs de Busca
  // ============================================

  const searchQueries = ["ração", "doação", "camiseta", "reflorestamento", "kit higiene"];

  for (let i = 0; i < 500; i++) {
    await prisma.searchLog.create({
      data: {
        query: faker.helpers.arrayElement(searchQueries),
        filters: { category: faker.helpers.arrayElement(["Food", "Toys", "Medicine"]) },
        aiSuccess: faker.datatype.boolean(),
        fallbackUsed: faker.datatype.boolean(),
        latency: faker.number.int({ min: 20, max: 800 }),
        resultsCount: faker.number.int({ min: 0, max: 30 }),
      },
    });
  }

  console.log("✅ Seed concluído com sucesso!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
