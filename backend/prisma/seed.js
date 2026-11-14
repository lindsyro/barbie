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
