import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventoDto {
    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;  // Se usa para buscar/crear hoja de vida

    @IsNumber()
    @IsNotEmpty()
    id_tipo_evento: number;

    @Type(() => Date)
    @IsNotEmpty()
    fecha_evento: Date;

    @IsString()
    @IsOptional()
    cargo_anterior?: string;

    @IsString()
    @IsOptional()
    cargo_nuevo?: string;

    @IsNumber()
    @IsOptional()
    salario_anterior?: number;

    @IsNumber()
    @IsOptional()
    salario_nuevo?: number;
}