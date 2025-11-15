import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  barcode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  costPrice: number;

  @IsNumber()
  salePrice: number;

  @IsNumber()
  currentStock: number;

  @IsNumber()
  minStock: number;
}