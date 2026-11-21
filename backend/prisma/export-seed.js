import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportSeed() {
  console.log("📦 Экспорт текущих данных из базы в prisma/seed.js...");

  const categories = await prisma.dollCategory.findMany({
    orderBy: { id: "asc" },
  });

  const dolls = await prisma.doll.findMany({
    orderBy: { id: "asc" },
  });

  const patterns = await prisma.pattern.findMany({
    include: {
      dolls: { select: { id: true } },
    },
    orderBy: { id: "asc" },
  });

  const reviews = await prisma.review.findMany({
    orderBy: { id: "asc" },
  });

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { id: "asc" },
  });

  const menuItems = await prisma.menuItem.findMany({
    orderBy: { order: "asc" },
  });

  // Получаем корзину и избранное демо-пользователя (если есть)
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@goose.ru" },
    include: {
      cartItems: true,
      wishlist: true,
    },
  });

  const cartPatternIds = demoUser?.cartItems?.length
    ? demoUser.cartItems.map((c) => c.patternId)
    : [27, 19];

  const wishlistPatternIds = demoUser?.wishlist?.length
    ? demoUser.wishlist.map((w) => w.patternId)
    : [27, 21, 22];

  const transformedPatterns = patterns.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    dollIds: p.dolls.map((d) => d.id),
  }));

  const transformedReviews = reviews.map((r) => ({
    author: r.author,
    doll: r.doll,
    patternTitle: r.patternTitle,
    rating: r.rating,
    text: r.text,
  }));

  const defaultMenuItems = [
    { id: 1, title: "Каталог выкроек", url: "#catalog", order: 1, target: "_self", isVisible: true, isDynamic: true },
    { id: 2, title: "Видеоуроки", url: "#tutorials", order: 2, target: "_self", isVisible: true, isDynamic: false },
    { id: 3, title: "Курсы", url: "#courses", order: 3, target: "_self", isVisible: true, isDynamic: false },
    { id: 4, title: "Бесплатно", url: "#free", order: 4, target: "_self", isVisible: true, isDynamic: false },
    { id: 5, title: "Полезное", url: "#useful", order: 5, target: "_self", isVisible: true, isDynamic: false },
    { id: 6, title: "О нас", url: "#about", order: 6, target: "_self", isVisible: true, isDynamic: false },
  ];

  const transformedMenuItems = menuItems.length > 0
    ? menuItems.map((m) => ({
        id: m.id,
        title: m.title,
        url: m.url,
        order: m.order,
        target: m.target,
        isVisible: m.isVisible,
        isDynamic: m.isDynamic,
      }))
    : defaultMenuItems;

  const content = `import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Наполнение базы данных goose начальными данными (пользователи, отзывы, подписки)...");

  // 1. Демо-пользователь
  const demoSalt = crypto.randomBytes(16).toString("hex");
  const demoPasswordHash = crypto.scryptSync("password123", demoSalt, 64).toString("hex");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@goose.ru" },
    update: {},
    create: {
      email: "demo@goose.ru",
      name: "Ирина",
      passwordHash: demoPasswordHash,
      salt: demoSalt,
    },
  });

  // Демо-токен
  await prisma.session.upsert({
    where: { token: "demo-token-12345" },
    update: {},
    create: {
      token: "demo-token-12345",
      userId: demoUser.id,
    },
  });

  // Предзаполненная корзина демо-пользователя
  await prisma.cartItem.deleteMany({ where: { contextId: demoUser.id } });
  await prisma.cartItem.createMany({
    data: ${JSON.stringify(
      cartPatternIds.map((patternId) => ({
        contextId: "__DEMO_USER_ID__",
        userId: "__DEMO_USER_ID__",
        patternId,
      })),
      null,
      6
    ).replace(/"__DEMO_USER_ID__"/g, "demoUser.id")},
  });

  // Предзаполненное избранное демо-пользователя
  await prisma.wishlistItem.deleteMany({ where: { contextId: demoUser.id } });
  await prisma.wishlistItem.createMany({
    data: ${JSON.stringify(
      wishlistPatternIds.map((patternId) => ({
        contextId: "__DEMO_USER_ID__",
        userId: "__DEMO_USER_ID__",
        patternId,
      })),
      null,
      6
    ).replace(/"__DEMO_USER_ID__"/g, "demoUser.id")},
  });

  console.log("✓ Демо-пользователь (demo@goose.ru / password123) создан");

  // 2. Отзывы
  const reviewsCount = await prisma.review.count();
  if (reviewsCount === 0) {
    await prisma.review.createMany({
      data: ${JSON.stringify(transformedReviews, null, 8).trim()},
    });
    console.log("✓ Отзывы добавлены");
  }

  // 3. Подписчики
  const subscribersData = ${JSON.stringify(
    subscribers.map((s) => ({ email: s.email, promoCode: s.promoCode })),
    null,
    4
  )};
  for (const sub of subscribersData) {
    await prisma.subscriber.upsert({
      where: { email: sub.email },
      update: {},
      create: sub,
    });
  }

  // 4. Категории кукол (doll_categories)
  const DOLL_CATEGORIES = ${JSON.stringify(
    categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, order: c.order })),
    null,
    4
  )};

  console.log("Добавление категорий в doll_categories...");
  for (const cat of DOLL_CATEGORIES) {
    await prisma.dollCategory.upsert({
      where: { id: cat.id },
      update: {
        slug: cat.slug,
        name: cat.name,
        order: cat.order,
      },
      create: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        order: cat.order,
      },
    });
  }
  console.log(\`✓ Категории кукол добавлены (\${DOLL_CATEGORIES.length} категории)\`);

  // 5. Таблица dolls
  const DOLLS_DATA = ${JSON.stringify(
    dolls.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      nameEn: d.nameEn,
      nameRu: d.nameRu,
      categoryId: d.categoryId,
      height: d.height,
      measurementsFileName: d.measurementsFileName || null,
    })),
    null,
    4
  )};

  console.log("Добавление кукол в таблицу dolls...");
  for (const doll of DOLLS_DATA) {
    await prisma.doll.upsert({
      where: { id: doll.id },
      update: {
        fileName: doll.fileName,
        nameEn: doll.nameEn,
        nameRu: doll.nameRu,
        height: doll.height,
        categoryId: doll.categoryId,
        measurementsFileName: doll.measurementsFileName || null,
      },
      create: {
        id: doll.id,
        fileName: doll.fileName,
        nameEn: doll.nameEn,
        nameRu: doll.nameRu,
        height: doll.height,
        categoryId: doll.categoryId,
        measurementsFileName: doll.measurementsFileName || null,
      },
    });
  }
  console.log(\`✓ Таблица dolls заполнена (\${DOLLS_DATA.length} кукол)\`);

  // 6. Таблица patterns и связи с куклами
  console.log("Добавление выкроек в patterns и связей со связанными куклами...");
  const PATTERNS_DATA = ${JSON.stringify(transformedPatterns, null, 4)};

  for (const p of PATTERNS_DATA) {
    await prisma.pattern.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        price: p.price,
        dolls: {
          set: p.dollIds.map((id) => ({ id })),
        },
      },
      create: {
        id: p.id,
        title: p.title,
        price: p.price,
        dolls: {
          connect: p.dollIds.map((id) => ({ id })),
        },
      },
    });
  }
  console.log(\`✓ Таблица patterns заполнена (\${PATTERNS_DATA.length} выкроек со связями)\`);

  // 7. Таблица menu_items
  console.log("Добавление пунктов меню в menu_items...");
  const MENU_ITEMS_DATA = \${JSON.stringify(transformedMenuItems, null, 4)};

  for (const item of MENU_ITEMS_DATA) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        url: item.url,
        order: item.order,
        target: item.target,
        isVisible: item.isVisible,
        isDynamic: item.isDynamic,
      },
      create: {
        id: item.id,
        title: item.title,
        url: item.url,
        order: item.order,
        target: item.target,
        isVisible: item.isVisible,
        isDynamic: item.isDynamic,
      },
    });
  }
  console.log(\`✓ Таблица menu_items заполнена (\${MENU_ITEMS_DATA.length} пунктов меню)\`);

  console.log("🎉 База данных goose успешно наполнена!");
}

main()
  .catch((e) => {
    console.error("Ошибка сидирования базы:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const seedPath = path.join(__dirname, "seed.js");
  await fs.writeFile(seedPath, content, "utf-8");
  console.log(`✅ prisma/seed.js успешно обновлён данными из текущей базы:`);
  console.log(`   - Категорий: ${categories.length}`);
  console.log(`   - Кукол: ${dolls.length}`);
  console.log(`   - Выкроек: ${patterns.length}`);
  console.log(`   - Отзывов: ${reviews.length}`);
  console.log(`   - Пунктов меню: ${transformedMenuItems.length}`);
}

exportSeed()
  .catch((err) => {
    console.error("❌ Ошибка при экспорте сидов:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
