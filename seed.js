const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  
  if (users.length === 0) {
    console.log('Nenhum usuário encontrado. Criando um usuário de teste...');
    const user = await prisma.user.create({
      data: {
        name: 'João Teste',
        phone: '11999999999',
        role: 'USER',
      }
    });
    
    const service = await prisma.service.findFirst();
    if (service) {
      await prisma.appointment.create({
        data: {
          date: new Date(),
          status: 'PENDING',
          userId: user.id,
          serviceId: service.id
        }
      });
      console.log('Usuário e agendamento de teste criados!');
    } else {
      console.log('Nenhum serviço encontrado. Crie um serviço primeiro.');
    }
  }
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
