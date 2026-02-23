import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoEventosService } from './catalogo-eventos.service';
import { CatalogoEventosController } from './catalogo-eventos.controller';
import { CatalogoEventos } from './entities/catalogo-evento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogoEventos])],
  controllers: [CatalogoEventosController],
  providers: [CatalogoEventosService],
  exports: [CatalogoEventosService]
})
export class CatalogoEventosModule { }