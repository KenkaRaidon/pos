import { IsArray, IsNumber, IsString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number; // Precio al momento de la venta
}

export class CreateSaleDto {
  @IsNumber()
  total: number;

  @IsString()
  paymentMethod: string; // 'EFECTIVO', 'TARJETA'

  @IsNumber()
  userId: number; // Quién hizo la venta (Cajero)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}