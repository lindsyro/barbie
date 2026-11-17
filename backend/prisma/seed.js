import { PrismaClient } from "@prisma/client";
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

  // Предзаполненная корзина демо-пользователя (выкройки 27 и 19 из каталога)
  await prisma.cartItem.deleteMany({ where: { contextId: demoUser.id } });
  await prisma.cartItem.createMany({
    data: [
      { contextId: demoUser.id, userId: demoUser.id, patternId: 27 },
      { contextId: demoUser.id, userId: demoUser.id, patternId: 19 },
    ],
    skipDuplicates: true,
  });

  // Предзаполненное избранное демо-пользователя (выкройки 27, 21, 22 из каталога)
  await prisma.wishlistItem.deleteMany({ where: { contextId: demoUser.id } });
  await prisma.wishlistItem.createMany({
    data: [
      { contextId: demoUser.id, userId: demoUser.id, patternId: 27 },
      { contextId: demoUser.id, userId: demoUser.id, patternId: 21 },
      { contextId: demoUser.id, userId: demoUser.id, patternId: 22 },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Демо-пользователь (demo@goose.ru / password123) создан");

  // 2. Отзывы
  const reviewsCount = await prisma.review.count();
  if (reviewsCount === 0) {
    await prisma.review.createMany({
      data: [
        {
          author: "Елена Смирнова",
          doll: "Барби Made to Move",
          patternTitle: "Водолазка-боди для Барби стандарт",
          rating: 5,
          text: "Выкройка идеальная! Села на Йогу как влитая, никаких лишних складок. Контрольный квадрат на А4 совпал с первого раза.",
        },
        {
          author: "Анастасия",
          doll: "MiniFee Chloe",
          patternTitle: "Кофточка и брюки клёш для MiniFee",
          rating: 5,
          text: "Найти хорошую выкройку на Минифи сложно, но этот комплект превзошел все ожидания! Спасибо за видео-пояснения.",
        },
        {
          author: "Мария К.",
          doll: "Ken BMR1959",
          patternTitle: "Водолазка-боди для Ken",
          rating: 5,
          text: "Кен теперь одет стильно! Шьётся за полчаса, очень подробное описание.",
        },
      ],
    });
    console.log("✓ Отзывы добавлены");
  }

  // 3. Подписчик
  await prisma.subscriber.upsert({
    where: { email: "demo@goose.ru" },
    update: {},
    create: {
      email: "demo@goose.ru",
      promoCode: "GOOSE10",
    },
  });

  // 4. Таблица doll_categories и dolls с наполнением данными
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "dolls" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "doll_categories" CASCADE;`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "doll_categories" (
      "id" SERIAL NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT "doll_categories_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "doll_categories_slug_key" ON "doll_categories"("slug");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "dolls" (
      "id" SERIAL NOT NULL,
      "fileName" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL,
      "nameRu" TEXT NOT NULL,
      "height" DOUBLE PRECISION NOT NULL,
      "measurementsFileName" TEXT,
      "categoryId" INTEGER NOT NULL,
      CONSTRAINT "dolls_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "dolls_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "doll_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);

  const DOLL_CATEGORIES = [
    { id: 1, name: "Для девушек 1/6", slug: "girls-1-6", order: 1 },
    { id: 2, name: "Для девушек 1/4", slug: "girls-1-4", order: 2 },
    { id: 3, name: "Для парней", slug: "guys", order: 3 },
    { id: 4, name: "Для детей", slug: "kids", order: 4 },
  ];

  console.log("Добавление категорий в doll_categories...");
  for (const cat of DOLL_CATEGORIES) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "doll_categories" ("id", "slug", "name", "order")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("id") DO UPDATE SET
         "slug" = EXCLUDED."slug",
         "name" = EXCLUDED."name",
         "order" = EXCLUDED."order";`,
      cat.id,
      cat.slug,
      cat.name,
      cat.order
    );
  }
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('doll_categories', 'id'), coalesce(max(id), 1)) FROM "doll_categories";`
  );
  console.log(`✓ Категории кукол добавлены (${DOLL_CATEGORIES.length} категории)`);

  const DOLLS_DATA = [
    {
      id: 1,
      fileName: "Кукла в матовом серо-синем купальнике-15.png",
      nameEn: "Barbie MTM Petite",
      nameRu: "Барби петит",
      categoryId: 1,
      height: 29.2,
      measurementsFileName: "barbiePetit.png",
    },
    {
      id: 2,
      fileName: "Кукла в матовом сланцево-синем купальнике-16.png",
      nameEn: "Barbie MTM Standart",
      nameRu: "Барби стандарт",
      categoryId: 1,
      height: 29.5,
      measurementsFileName: "barbieStandart.png",
    },
    {
      id: 3,
      fileName: "Барби Made to Move в синем купальнике.png",
      nameEn: "Barbie MTM Tall",
      nameRu: "Барби высокая",
      categoryId: 1,
      height: 29.0,
      measurementsFileName: "tall.png",
    },
    {
      id: 4,
      fileName: "Кукла в матовом синем купальнике-8.png",
      nameEn: "Barbie MTM Curvy",
      nameRu: "Барби пышка",
      categoryId: 1,
      height: 29.5,
      measurementsFileName: "barbieCurvy.png",
    },
    {
      id: 5,
      fileName: "Кукла в сланцево-синем купальнике-6.png",
      nameEn: "Barbie 90s",
      nameRu: "Барби 90-х",
      categoryId: 1,
      height: 29.0,
      measurementsFileName: "barbie90.png",
    },
    {
      id: 6,
      fileName: "Кукла в матово-синем купальнике-3.png",
      nameEn: "Barbie Kelly",
      nameRu: "Барби Келли",
      categoryId: 4,
      height: 31.5,
      measurementsFileName: "barbieKelli.png",
    },
    {
      id: 7,
      fileName: "Каталожная кукла в сланцево-синем купальнике-5.png",
      nameEn: "Integrity Toys Fashion Royalty 6",
      nameRu: "Интегрити ФР6",
      categoryId: 1,
      height: 29.0,
      measurementsFileName: "fashionRoyalty.png",
    },
    {
      id: 8,
      fileName: "Кукла в закрытом сланцево-синем купальнике-4.png",
      nameEn: "Integrity Toys NU Face",
      nameRu: "Интегрити ню фейс",
      categoryId: 1,
      height: 26.5,
      measurementsFileName: "NuFace.png",
    },
    {
      id: 9,
      fileName: "Кукла в сланцево-синем купальнике-14.png",
      nameEn: "Integrity Industry",
      nameRu: "Интегрити индастри",
      categoryId: 1,
      height: 26.5,
      measurementsFileName: null,
    },
    {
      id: 10,
      fileName: "Кукла в сланцево-синем купальнике-13.png",
      nameEn: "Poppy Parker",
      nameRu: "Поппи Паркер",
      categoryId: 1,
      height: 29.0,
      measurementsFileName: "poppyParker.png",
    },
    {
      id: 11,
      fileName: "Коллекционная кукла в сланцево-синем купальнике-2.png",
      nameEn: "Integrity Fashion Royalty 16",
      nameRu: "Интегрити ФР16",
      categoryId: 2,
      height: 29.5,
      measurementsFileName: null,
    },
    {
      id: 12,
      fileName: "Кукла в сланцево-синем купальнике-18.png",
      nameEn: "Poppy Parker FR 16",
      nameRu: "Поппи Паркер ФР16",
      categoryId: 2,
      height: 29.3,
      measurementsFileName: null,
    },
    {
      id: 13,
      fileName: "Коллекционная кукла в серо-синем купальнике-1.png",
      nameEn: "Minifi",
      nameRu: "Минифи",
      categoryId: 2,
      height: 30.5,
      measurementsFileName: "minifi.png",
    },
    {
      id: 14,
      fileName: "Кукла в матовом серо-синем купальнике-11.png",
      nameEn: "Mizi Katie Girl",
      nameRu: "Мизи Кети Герл",
      categoryId: 1,
      height: 30.0,
      measurementsFileName: "miziKatieGirl.png",
    },
    {
      id: 15,
      fileName: "Кукла в матовом серо-синем купальнике-12.png",
      nameEn: "Momoko",
      nameRu: "Момоко",
      categoryId: 1,
      height: 29.0,
      measurementsFileName: "momoko.png",
    },
    {
      id: 16,
      fileName: "Зелёноволосая кукла с розовыми узорами-8.png",
      nameEn: "Rainbow High",
      nameRu: "Рейнбоу хай",
      categoryId: 1,
      height: 28.0,
      measurementsFileName: null,
    },
    {
      id: 17,
      fileName: "Кукла в серо-синем купальнике на светлом фоне-9.png",
      nameEn: "Blythe",
      nameRu: "Блайз",
      categoryId: 1,
      height: 29.0,
      measurementsFileName: null,
    },
    {
      id: 18,
      fileName: "Рыжеволосая кукла в сланцево-синем купальнике-7.png",
      nameEn: "Paola Reina / Berjuan",
      nameRu: "Паола Рейна (Берджуан)",
      categoryId: 4,
      height: 29.0,
      measurementsFileName: null,
    },
    {
      id: 19,
      fileName: "Игрушечная кукла в синих плавках-1.png",
      nameEn: "Ken MTM Standart",
      nameRu: "Кен стандарт",
      categoryId: 3,
      height: 30.5,
      measurementsFileName: "kenStandart.png",
    },
    {
      id: 20,
      fileName: "Мужская кукла в матово-синих плавках-10.png",
      nameEn: "Ken MTM",
      nameRu: "Кен качок",
      categoryId: 3,
      height: 31.5,
      measurementsFileName: "kenBaff.png",
    },
    {
      id: 21,
      fileName: "Кукла в матовых синих плавках-2.png",
      nameEn: "Integrity FR Homme",
      nameRu: "Интегрити ФР хомм",
      categoryId: 3,
      height: 30.5,
      measurementsFileName: "homme.png",
    },
    {
      id: 22,
      fileName: "Мужская кукла в матовых синих плавках-4.png",
      nameEn: "Integrity Monarch",
      nameRu: "Интегрити монарх",
      categoryId: 3,
      height: 30.5,
      measurementsFileName: "monarch.png",
    },
    {
      id: 23,
      fileName: "Кукла в сланцево-синих плавках-5.png",
      nameEn: "Adonis 2.0",
      nameRu: "Адонис 2.0",
      categoryId: 3,
      height: 30.0,
      measurementsFileName: "adonis.png",
    },
    {
      id: 24,
      fileName: "Кукла в матовых синих плавках-7.png",
      nameEn: "Necot Doll",
      nameRu: "Некотт долл",
      categoryId: 3,
      height: 30.5,
      measurementsFileName: "nekotDoll.png",
    },
  ];

  console.log("Добавление кукол в таблицу dolls...");
  for (const doll of DOLLS_DATA) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "dolls" ("id", "fileName", "nameEn", "nameRu", "height", "categoryId", "measurementsFileName")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT ("id") DO UPDATE SET
         "fileName" = EXCLUDED."fileName",
         "nameEn" = EXCLUDED."nameEn",
         "nameRu" = EXCLUDED."nameRu",
         "height" = EXCLUDED."height",
         "categoryId" = EXCLUDED."categoryId",
         "measurementsFileName" = EXCLUDED."measurementsFileName";`,
      doll.id,
      doll.fileName,
      doll.nameEn,
      doll.nameRu,
      doll.height,
      doll.categoryId,
      doll.measurementsFileName || null
    );
  }

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('dolls', 'id'), coalesce(max(id), 1)) FROM "dolls";`
  );
  console.log(`✓ Таблица dolls заполнена (${DOLLS_DATA.length} кукол)`);

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
