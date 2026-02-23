import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';
import { Evento } from './entities/evento.entity';
import { HojaVida } from '../hoja-vida/entities/hoja-vida.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { CatalogoEventos } from '../catalogo-eventos/entities/catalogo-evento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, HojaVida, Empleado, CatalogoEventos])],
  controllers: [EventoController],
  providers: [EventoService],
  exports: [EventoService]
})
export class EventoModule { }
