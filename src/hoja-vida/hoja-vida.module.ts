import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HojaVidaService } from './hoja-vida.service';
import { HojaVidaController } from './hoja-vida.controller';
import { HojaVida } from './entities/hoja-vida.entity';
import { Empleado } from '../empleado/entities/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HojaVida, Empleado])],
  controllers: [HojaVidaController],
  providers: [HojaVidaService],
  exports: [HojaVidaService]
})
export class HojaVidaModule { }