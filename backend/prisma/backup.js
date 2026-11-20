import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "dev.db");
const BACKUPS_DIR = path.join(__dirname, "backups");

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const min = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return `${y}-${m}-${d}_${h}-${min}-${s}`;
}

async function backup() {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    const stat = await fs.stat(DB_PATH);
    if (!stat.isFile()) {
      throw new Error(`Файл БД не найден: ${DB_PATH}`);
    }

    const timestamp = getTimestamp();
    const backupFile = path.join(BACKUPS_DIR, `dev_${timestamp}.db`);
    const latestFile = path.join(BACKUPS_DIR, "latest.db");

    await fs.copyFile(DB_PATH, backupFile);
    await fs.copyFile(DB_PATH, latestFile);

    console.log(`💾 Бэкап базы данных успешно создан:`);
    console.log(`   - Снимок: prisma/backups/dev_${timestamp}.db`);
    console.log(`   - Копия:  prisma/backups/latest.db`);
  } catch (err) {
    console.error("❌ Ошибка создания бэкапа:", err.message);
    process.exit(1);
  }
}

async function restore(targetFile) {
  try {
    const fileToRestore = targetFile
      ? path.resolve(process.cwd(), targetFile)
      : path.join(BACKUPS_DIR, "latest.db");

    await fs.access(fileToRestore);

    // Создаем защитный бэкап перед восстановлением
    const preRestoreBackup = path.join(BACKUPS_DIR, `pre_restore_${getTimestamp()}.db`);
    try {
      await fs.copyFile(DB_PATH, preRestoreBackup);
    } catch {
      // Игнорируем, если базы еще не было
    }

    await fs.copyFile(fileToRestore, DB_PATH);
    console.log(`♻️  База данных успешно восстановлена из:`);
    console.log(`   ${path.relative(process.cwd(), fileToRestore)} -> prisma/dev.db`);
  } catch (err) {
    console.error("❌ Ошибка восстановления базы:", err.message);
    process.exit(1);
  }
}

async function list() {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    const files = await fs.readdir(BACKUPS_DIR);
    const dbFiles = files.filter((f) => f.endsWith(".db") && f !== "latest.db");

    if (dbFiles.length === 0) {
      console.log("Нет сохранённых бэкапов в prisma/backups/");
      return;
    }

    console.log(`📋 Список доступных бэкапов (${dbFiles.length}):`);
    for (const f of dbFiles.sort().reverse()) {
      const s = await fs.stat(path.join(BACKUPS_DIR, f));
      const sizeKb = (s.size / 1024).toFixed(1);
      console.log(`   - ${f} (${sizeKb} KB)`);
    }
  } catch (err) {
    console.error("❌ Ошибка чтения списка бэкапов:", err.message);
    process.exit(1);
  }
}

const command = process.argv[2] || "backup";
const arg = process.argv[3];

switch (command) {
  case "backup":
    backup();
    break;
  case "restore":
    restore(arg);
    break;
  case "list":
    list();
    break;
  default:
    console.log("Использование: node prisma/backup.js [backup | restore | list]");
}
