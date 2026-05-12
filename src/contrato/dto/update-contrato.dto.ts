import {
    IsOptional,
    IsBoolean,
    IsDateString,
    IsInt,
    Min
} from 'class-validator';

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

    @IsInt({ message: 'id_tipo_contrato debe ser un número entero' })
    @Min(1, { message: 'id_tipo_contrato debe ser mayor a 0' })
    @IsOptional()
    id_tipo_contrato?: number;
}