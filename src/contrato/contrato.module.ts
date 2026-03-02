import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoService } from './contrato.service';
import { ContratoController } from './contrato.controller';
import { Contrato } from './entities/contrato.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { TipoContrato } from '../tipo-contrato/entities/tipo-contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, Empleado, TipoContrato])],
  controllers: [ContratoController],
  providers: [ContratoService],
  exports: [ContratoService]
})
export class ContratoModule { }