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

  const pattern = {
    id: 27,
    title: "Водолазка-боди для Барби стандарт",
    doll: "Barbie Standard (Барби стандарт)",
    price: 450,
    format: "PDF + видеоурок",
    downloadUrl: "/patterns/27/1.png",
  };

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
            format: pattern.format,
            downloadUrl: pattern.downloadUrl,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log(`🎉 Заказ #${order.id} успешно привязан к пользователю ${user.name}!`);
}

main()
  .catch((e) => {
    console.error("Ошибка добавления заказа:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
