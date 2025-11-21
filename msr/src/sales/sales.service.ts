import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { items, total, paymentMethod, userId } = createSaleDto;

    // INICIO DE LA TRANSACCIÓN (Todo o Nada)
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Recorrer cada item para verificar y restar stock
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new BadRequestException(`Producto ID ${item.productId} no encontrado`);
        }

        if (product.currentStock < item.quantity) {
            // Opcional: Lanzar error si no hay stock suficiente
            // throw new BadRequestException(`Stock insuficiente para ${product.name}`);
        }

        // Restar del inventario
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity, // Resta atómica
            },
          },
        });
      }

      // 2. Crear la Venta y sus Items en la tabla Sale
      const sale = await tx.sale.create({
        data: {
          total: total,
          status: 'COMPLETED',
          paymentMethod: paymentMethod,
          userId: userId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true, // Incluir información del producto
            },
          },
          user: true, // Incluir información del usuario
        },
      });

      return sale;
    });
  }
  
  // ... puedes dejar findAll y findOne como vienen por defecto o borrarlos si no los usas
  findAll() { return `This action returns all sales`; }

  findOne(id: number) { return `This action returns a #${id} sale`; }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
