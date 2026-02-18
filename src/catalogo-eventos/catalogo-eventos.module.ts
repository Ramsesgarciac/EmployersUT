import { Module } from '@nestjs/common';
import { CatalogoEventosService } from './catalogo-eventos.service';
import { CatalogoEventosController } from './catalogo-eventos.controller';

@Module({
  controllers: [CatalogoEventosController],
  providers: [CatalogoEventosService],
})
export class CatalogoEventosModule {}
