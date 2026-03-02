import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContratoDto {
    @Type(() => Date)
    @IsOptional()
    fecha_inicio?: Date;

    @Type(() => Date)
    @IsOptional()
    fecha_fin?: Date;

    @IsBoolean()
    @IsOptional()
    vigente?: boolean;
}