import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Asegúrate que la ruta sea correcta

@Injectable()
export class ProductsService {
  
  // Inyectamos Prisma
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Guardamos en la DB
    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll() {
    // Traemos todos los productos activos
    return await this.prisma.product.findMany({
      where: { isActive: true }
    });
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }
  
  // Método extra útil para el POS: Buscar por código de barras
  async findByBarcode(barcode: string) {
    return await this.prisma.product.findUnique({
      where: { barcode },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: number) {
    // Soft Delete: No borramos, solo desactivamos
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}