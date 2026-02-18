import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenciaService } from './incidencia.service';
import { IncidenciaController } from './incidencia.controller';
import { Incidencia } from './entities/incidencia.entity';
import { Justificante } from '../justificante/entities/justificante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incidencia, Justificante])],
  controllers: [IncidenciaController],
  providers: [IncidenciaService],
  exports: [IncidenciaService]
})
export class IncidenciaModule { }