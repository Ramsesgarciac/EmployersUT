import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoDto } from './create-evento.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateEventoDto extends PartialType(
    OmitType(CreateEventoDto, ['id_empleado'] as const)
) { }