import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoContratoService } from './tipo-contrato.service';
import { TipoContratoController } from './tipo-contrato.controller';
import { TipoContrato } from './entities/tipo-contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoContrato])],
  controllers: [TipoContratoController],
  providers: [TipoContratoService],
  exports: [TipoContratoService]
})
export class TipoContratoModule { }