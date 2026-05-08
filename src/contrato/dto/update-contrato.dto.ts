import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateContratoDto {
    @IsDateString({}, { message: 'fecha_inicio debe tener formato YYYY-MM-DD' })
    @IsOptional()
    fecha_inicio?: string;

    @IsDateString({}, { message: 'fecha_fin debe tener formato YYYY-MM-DD' })
    @IsOptional()
    fecha_fin?: string;

    @IsBoolean()
    @IsOptional()
    vigente?: boolean;
}