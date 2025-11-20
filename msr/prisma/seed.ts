import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes (opcional)
  await prisma.product.deleteMany();
  console.log('🗑️  Datos anteriores eliminados');

  // Crear productos de ejemplo
  const products = [
    {
      barcode: '75010553',
      name: 'Coca Cola 600ml',
      costPrice: 12.5,
      salePrice: 18,
      currentStock: 24,
      minStock: 5,
    },
    {
      barcode: '7501000153107',
      name: 'Pan Bimbo Grande',
      costPrice: 38,
      salePrice: 52,
      currentStock: 20,
      minStock: 5,
    },
    {
      barcode: '7501030490832',
      name: 'Tortillinas Tia Rosa',
      costPrice: 18,
      salePrice: 26,
      currentStock: 30,
      minStock: 8,
    },
    {
      barcode: '7501040094321',
      name: 'Leche Lala 1L',
      costPrice: 22,
      salePrice: 29,
      currentStock: 40,
      minStock: 10,
    },
    {
      barcode: '7501020663123',
      name: 'Aceite 1-2-3',
      costPrice: 35,
      salePrice: 48.5,
      currentStock: 20,
      minStock: 5,
    },
    {
      barcode: '7500478007904',
      name: 'Jabon Zote',
      costPrice: 15,
      salePrice: 22,
      currentStock: 25,
      minStock: 10,
    },
    {
      barcode: '7501000612345',
      name: 'Sabritas Adobadas',
      costPrice: 11,
      salePrice: 17,
      currentStock: 15,
      minStock: 5,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ ${products.length} productos creados`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Seed completado exitosamente');
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
