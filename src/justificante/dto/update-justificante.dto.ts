import { PartialType } from '@nestjs/mapped-types';
import { CreateJustificanteDto } from './create-justificante.dto';

export class UpdateJustificanteDto extends PartialType(CreateJustificanteDto) {}
