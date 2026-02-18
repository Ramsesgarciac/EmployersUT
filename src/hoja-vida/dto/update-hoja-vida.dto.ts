import { PartialType } from '@nestjs/mapped-types';
import { CreateHojaVidaDto } from './create-hoja-vida.dto';

export class UpdateHojaVidaDto extends PartialType(CreateHojaVidaDto) {}
