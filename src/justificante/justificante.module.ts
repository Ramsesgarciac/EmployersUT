import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JustificanteService } from './justificante.service';
import { JustificanteController } from './justificante.controller';
import { Justificante } from './entities/justificante.entity';
import { Incidencia } from '../incidencia/entities/incidencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Justificante, Incidencia])],
  controllers: [JustificanteController],
  providers: [JustificanteService],
  exports: [JustificanteService]
})
export class JustificanteModule { }