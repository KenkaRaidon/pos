import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuario admin por defecto
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123', // TODO: En producción usar bcrypt
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Crear cajero por defecto
  const cajero = await prisma.user.upsert({
    where: { username: 'cajero' },
    update: {},
    create: {
      username: 'cajero',
      password: 'cajero123', // TODO: En producción usar bcrypt
      name: 'Cajero Principal',
      role: 'CAJERO',
      isActive: true,
    },
  });

  console.log('✅ Usuarios creados:', { admin, cajero });

  // Crear categorías
  const bebidas = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Bebidas' },
  });

  const abarrotes = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Abarrotes' },
  });

  console.log('✅ Categorías creadas:', { bebidas, abarrotes });

  // Crear productos de ejemplo
  const productos = [
    {
      barcode: '7501234567890',
      name: 'Coca Cola 600ml',
      description: 'Refresco de cola',
      costPrice: 10,
      salePrice: 15,
      currentStock: 50,
      minStock: 10,
      categoryId: bebidas.id,
    },
    {
      barcode: '7501234567891',
      name: 'Sabritas Original 45g',
      description: 'Papas fritas',
      costPrice: 8,
      salePrice: 12,
      currentStock: 100,
      minStock: 20,
      categoryId: abarrotes.id,
    },
    {
      barcode: '7501234567892',
      name: 'Leche Lala 1L',
      description: 'Leche entera',
      costPrice: 18,
      salePrice: 25,
      currentStock: 30,
      minStock: 5,
      categoryId: abarrotes.id,
    },
  ];

  for (const prod of productos) {
    await prisma.product.upsert({
      where: { barcode: prod.barcode },
      update: {},
      create: prod,
    });
  }

  console.log('✅ Productos creados');
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
