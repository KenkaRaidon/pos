import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Asegúrate que la ruta sea correcta

@Injectable()
export class ProductsService {
  
  // Inyectamos Prisma
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Guardamos en la DB
      return await this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      // Manejar error de código de barras duplicado
      if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
        throw new Error(`El código de barras "${createProductDto.barcode}" ya existe en otro producto`);
      }
      // Re-lanzar otros errores
      throw error;
    }
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

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      // Manejar error de código de barras duplicado
      if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
        throw new Error(`El código de barras "${updateProductDto.barcode}" ya existe en otro producto`);
      }
      // Re-lanzar otros errores
      throw error;
    }
  }

  remove(id: number) {
    // Soft Delete: No borramos, solo desactivamos
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}