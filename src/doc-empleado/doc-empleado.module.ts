import { Module } from '@nestjs/common';
import { DocEmpleadoService } from './doc-empleado.service';
import { DocEmpleadoController } from './doc-empleado.controller';

@Module({
  controllers: [DocEmpleadoController],
  providers: [DocEmpleadoService],
})
export class DocEmpleadoModule {}
