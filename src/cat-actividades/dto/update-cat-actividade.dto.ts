import { PartialType } from '@nestjs/mapped-types';
import { CreateCatActividadeDto } from './create-cat-actividade.dto';

export class UpdateCatActividadeDto extends PartialType(CreateCatActividadeDto) {}
