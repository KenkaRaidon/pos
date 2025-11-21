import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productsService.create(createProductDto);
    } catch (error) {
      if (error.message.includes('ya existe')) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      return await this.productsService.update(+id, updateProductDto);
    } catch (error) {
      if (error.message.includes('ya existe')) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
  @Get('barcode/:code') // La ruta será: /products/barcode/75010553
  async findByBarcode(@Param('code') code: string) {
    const product = await this.productsService.findByBarcode(code);
    if (!product) {
      // Si no existe, regresamos un 404 (Not Found)
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }
}
