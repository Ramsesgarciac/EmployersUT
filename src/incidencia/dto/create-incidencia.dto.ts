import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateIncidenciaDto {
    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;

    @IsNumber()
    @IsNotEmpty()
    id_tipo_incidencia: number;

    @IsDateString()
    @IsNotEmpty()
    fecha_inicio: string;

    @IsDateString()
    @IsNotEmpty()
    fecha_fin: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
