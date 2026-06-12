const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findFirst();
  console.log("LOGO_URL:", settings?.logoUrl);
}

main().finally(() => prisma.$disconnect());
