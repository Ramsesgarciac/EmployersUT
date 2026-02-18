import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoIncidenciaService } from './tipo-incidencia.service';
import { TipoIncidenciaController } from './tipo-incidencia.controller';
import { TipoIncidencia } from './entities/tipo-incidencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoIncidencia])],
  controllers: [TipoIncidenciaController],
  providers: [TipoIncidenciaService],
  exports: [TipoIncidenciaService]
})
export class TipoIncidenciaModule { }