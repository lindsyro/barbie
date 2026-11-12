import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Наполнение базы данных goose начальными данными...");

  // 1. Категории
  const categoriesData = [
    { id: "all", name: "Все выкройки", scale: "all" },
    { id: "barbie-std", name: "Барби Standard", scale: "1/6" },
    { id: "barbie-curvy", name: "Барби Curvy (Пышка)", scale: "1/6" },
    { id: "ken", name: "Кен (Ken)", scale: "1/6" },
    { id: "minifee", name: "MiniFee (BJD)", scale: "1/4" },
    { id: "blythe", name: "Блайз (Blythe)", scale: "1/6" },
    { id: "kids", name: "Куклы-дети (Chelsea, Lati)", scale: "kids" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log("✓ Категории добавлены");

  // 2. Выкройки
  const patternsData = [
    {
      id: 1,
      title: "Водолазка-боди для Барби",
      doll: "Барби / Made to Move",
      scale: "1/6",
      categoryId: "barbie-std",
      price: 490,
      tag: "Хит продаж",
      rating: 4.9,
      reviewsCount: 38,
      image: "/1.png",
      description: "Базовое облегающее боди с длинным рукавом и воротником-стойкой для кукол Barbie Made to Move и со стандартным типом тела. Включает детальные выкройки в формате PDF (А4) и пошаговый видеоурок.",
      difficulty: "Легкий",
      format: "PDF (A4 + инструкции)",
      isFeatured: true,
    },
    {
      id: 2,
      title: "Боди-бюстье «Афродита»",
      doll: "Барби Standard & Curvy",
      scale: "1/6",
      categoryId: "barbie-curvy",
      price: 550,
      tag: "Новинка",
      rating: 5.0,
      reviewsCount: 19,
      image: "/2.png",
      description: "Изящное вечернее боди с рельефными швами и чашечками. Подходит для классических и пышных тел Барби (Curvy).",
      difficulty: "Средний",
      format: "PDF (A4 + инструкции)",
      isFeatured: true,
    },
    {
      id: 3,
      title: "Выкройка MiniFee: кофточка и брюки клёш",
      doll: "MiniFee (40-42 см)",
      scale: "1/4",
      categoryId: "minifee",
      price: 690,
      tag: "BJD",
      rating: 4.8,
      reviewsCount: 14,
      image: "/3.png",
      description: "Стильный трикотажный комплект для шарнирных кукол BJD 1/4 (линейка Fairyland MiniFee Moe/Active line). Точная посадка по фигуре.",
      difficulty: "Средний",
      format: "PDF (A4 + инструкции)",
      isFeatured: true,
    },
    {
      id: 4,
      title: "Элегантная водолазка-боди для Кена",
      doll: "Ken Fashionistas / BMR1959",
      scale: "1/6",
      categoryId: "ken",
      price: 490,
      tag: "Мужская коллекция",
      rating: 4.9,
      reviewsCount: 22,
      image: "/4.png",
      description: "Мужская водолазка из эластичного трикотажа для кукол Ken со стандартным и мускулистым телом Broad.",
      difficulty: "Легкий",
      format: "PDF (A4 + инструкции)",
      isFeatured: true,
    },
    {
      id: 5,
      title: "Тренч оверсайз для Блайз",
      doll: "Блайз (Blythe)",
      scale: "1/6",
      categoryId: "blythe",
      price: 620,
      tag: "Тренды",
      rating: 4.9,
      reviewsCount: 17,
      image: "/5.png",
      description: "Двубортный тренчкот с поясом, эполетами и подкладкой для кукол Blythe (на родном или шарнирном теле TBL).",
      difficulty: "Продвинутый",
      format: "PDF (A4 + инструкции)",
      isFeatured: false,
    },
    {
      id: 6,
      title: "Платье с оборками для Челси",
      doll: "Челси (Chelsea)",
      scale: "kids",
      categoryId: "kids",
      price: 390,
      tag: "Малыши",
      rating: 5.0,
      reviewsCount: 9,
      image: "/6.png",
      description: "Нежное воздушное платье для кукол-сестричек Челси (14 см) с удобной застёжкой на микро-липучку.",
      difficulty: "Легкий",
      format: "PDF (A4 + инструкции)",
      isFeatured: false,
    },
  ];

  for (const pat of patternsData) {
    await prisma.pattern.upsert({
      where: { id: pat.id },
      update: pat,
      create: pat,
    });
  }
  console.log("✓ Выкройки добавлены");

  // 3. Демо-пользователь
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

  // Предзаполненная корзина демо-пользователя (2 цифровые выкройки)
  await prisma.cartItem.deleteMany({ where: { contextId: demoUser.id } });
  await prisma.cartItem.createMany({
    data: [
      { contextId: demoUser.id, userId: demoUser.id, patternId: 1 },
      { contextId: demoUser.id, userId: demoUser.id, patternId: 2 },
    ],
    skipDuplicates: true,
  });

  // Предзаполненное избранное демо-пользователя (3 выкройки)
  await prisma.wishlistItem.deleteMany({ where: { contextId: demoUser.id } });
  await prisma.wishlistItem.createMany({
    data: [
      { contextId: demoUser.id, userId: demoUser.id, patternId: 1 },
      { contextId: demoUser.id, userId: demoUser.id, patternId: 3 },
      { contextId: demoUser.id, userId: demoUser.id, patternId: 4 },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Демо-пользователь (demo@goose.ru / password123) создан");

  // 4. Отзывы
  const reviewsCount = await prisma.review.count();
  if (reviewsCount === 0) {
    await prisma.review.createMany({
      data: [
        {
          author: "Елена Смирнова",
          doll: "Барби Made to Move",
          patternTitle: "Водолазка-боди для Барби",
          rating: 5,
          text: "Выкройка идеальная! Села на Йогу как влитая, никаких лишних складок. Контрольный квадрат на А4 совпал с первого раза.",
        },
        {
          author: "Анастасия",
          doll: "MiniFee Chloe",
          patternTitle: "Выкройка MiniFee: кофточка и брюки клёш",
          rating: 5,
          text: "Найти хорошую выкройку на Минифи сложно, но этот комплект превзошел все ожидания! Спасибо за видео-пояснения.",
        },
        {
          author: "Мария К.",
          doll: "Ken BMR1959",
          patternTitle: "Элегантная водолазка-боди для Кена",
          rating: 5,
          text: "Кен теперь одет стильно! Шьётся за полчаса, очень подробное описание.",
        },
      ],
    });
    console.log("✓ Отзывы добавлены");
  }

  // 5. Подписчик
  await prisma.subscriber.upsert({
    where: { email: "demo@goose.ru" },
    update: {},
    create: {
      email: "demo@goose.ru",
      promoCode: "GOOSE10",
    },
  });

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
