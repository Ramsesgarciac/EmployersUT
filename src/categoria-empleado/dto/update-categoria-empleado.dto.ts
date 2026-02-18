import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaEmpleadoDto } from './create-categoria-empleado.dto';

export class UpdateCategoriaEmpleadoDto extends PartialType(CreateCategoriaEmpleadoDto) { }