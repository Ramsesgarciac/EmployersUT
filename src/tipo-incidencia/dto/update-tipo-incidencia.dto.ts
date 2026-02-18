import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoIncidenciaDto } from './create-tipo-incidencia.dto';

export class UpdateTipoIncidenciaDto extends PartialType(CreateTipoIncidenciaDto) { }