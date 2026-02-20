import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocEmpleadoService } from './doc-empleado.service';
import { DocEmpleadoController } from './doc-empleado.controller';
import { DocEmpleado } from './entities/doc-empleado.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { TipoDoc } from '../tipo-doc/entities/tipo-doc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocEmpleado, Empleado, TipoDoc]),
  ],
  controllers: [DocEmpleadoController],
  providers: [DocEmpleadoService],
})
export class DocEmpleadoModule { }
