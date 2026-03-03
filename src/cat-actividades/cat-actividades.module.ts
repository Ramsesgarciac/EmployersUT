
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatActividadesService } from './cat-actividades.service';
import { CatActividadesController } from './cat-actividades.controller';
import { CatActividades } from './entities/cat-actividade.entity';
import { CategoriaEmpleado } from '../categoria-empleado/entities/categoria-empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CatActividades, CategoriaEmpleado])],
  controllers: [CatActividadesController],
  providers: [CatActividadesService],
  exports: [CatActividadesService]
})
export class CatActividadesModule { }