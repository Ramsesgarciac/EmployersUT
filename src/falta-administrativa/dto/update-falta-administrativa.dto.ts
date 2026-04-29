import { PartialType } from '@nestjs/mapped-types';
import { CreateFaltaAdministrativaDto } from './create-falta-administrativa.dto';

export class UpdateFaltaAdministrativaDto extends PartialType(
    CreateFaltaAdministrativaDto
) { }
