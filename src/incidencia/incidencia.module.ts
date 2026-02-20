import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenciaService } from './incidencia.service';
import { IncidenciaController } from './incidencia.controller';
import { Incidencia } from './entities/incidencia.entity';
import { Justificante } from '../justificante/entities/justificante.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { TipoIncidencia } from '../tipo-incidencia/entities/tipo-incidencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incidencia, Justificante, Empleado, TipoIncidencia])],
  controllers: [IncidenciaController],
  providers: [IncidenciaService],
  exports: [IncidenciaService]
})
export class IncidenciaModule { }