import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogoEventoDto } from './create-catalogo-evento.dto';

export class UpdateCatalogoEventoDto extends PartialType(CreateCatalogoEventoDto) {}
