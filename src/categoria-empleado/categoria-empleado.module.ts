import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaEmpleadoService } from './categoria-empleado.service';
import { CategoriaEmpleadoController } from './categoria-empleado.controller';
import { CategoriaEmpleado } from './entities/categoria-empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaEmpleado])],
  controllers: [CategoriaEmpleadoController],
  providers: [CategoriaEmpleadoService],
  exports: [CategoriaEmpleadoService]
})
export class CategoriaEmpleadoModule { }