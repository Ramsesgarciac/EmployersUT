import { PartialType } from '@nestjs/mapped-types';
import { CreateDocEmpleadoDto } from './create-doc-empleado.dto';

export class UpdateDocEmpleadoDto extends PartialType(CreateDocEmpleadoDto) { }
