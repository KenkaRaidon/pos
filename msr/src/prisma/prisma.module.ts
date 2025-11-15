import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- Agrega esto
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- Agrega esto
})
export class PrismaModule {}