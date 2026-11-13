import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "0968420d-ed6d-4330-81d5-6f37fc46b331";

  // 1. Поиск пользователя
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: userId }, { email: "user@mail.ru" }, { name: "user" }],
    },
  });

  if (!user) {
    console.error("❌ Пользователь 'user' не найден в базе данных.");
    return;
  }

  console.log(`✓ Найден пользователь: ${user.name} (${user.email}, ID: ${user.id})`);

  // 2. Поиск выкройки (выбираем выкройку #1 «Водолазка-боди для Барби»)
  const pattern = await prisma.pattern.findUnique({
    where: { id: 1 },
  });

  if (!pattern) {
    console.error("❌ Выкройка #1 не найдена в базе данных.");
    return;
  }

  console.log(`✓ Выбрана выкройка для покупки: «${pattern.title}» (${pattern.doll}, ${pattern.price} ₽)`);

  const orderId = `ORD-774102-USER`;

  // 3. Создаем или обновляем оплаченный заказ в PostgreSQL
  const order = await prisma.order.upsert({
    where: { id: orderId },
    update: {
      status: "paid",
      totalAmount: pattern.price,
    },
    create: {
      id: orderId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      status: "paid",
      paymentMethod: "card",
      totalAmount: pattern.price,
      currency: "RUB",
      items: {
        create: [
          {
            patternId: pattern.id,
            title: pattern.title,
            doll: pattern.doll,
            price: pattern.price,
            format: pattern.format || "PDF (A4 + инструкции)",
            downloadUrl: `/downloads/patterns/${pattern.id}-pattern.pdf`,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log("\n🎉 Заказ успешно добавлен в базу данных:");
  console.log(`- Номер заказа: #${order.id}`);
  console.log(`- Статус: ${order.status}`);
  console.log(`- Сумма: ${order.totalAmount} ₽`);
  console.log(`- Позиции: ${order.items.map((it) => it.title).join(", ")}`);
}

main()
  .catch((e) => {
    console.error("Ошибка при добавлении заказа:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
