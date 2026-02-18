import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateIncidenciaDto {
    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;

    @IsNumber()
    @IsNotEmpty()
    id_tipo_incidencia: number;

    @Type(() => Date)
    @IsNotEmpty()
    fecha_inicio: Date;

    @Type(() => Date)
    @IsNotEmpty()
    fecha_fin: Date;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
