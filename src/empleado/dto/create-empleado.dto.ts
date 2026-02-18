import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateEmpleadoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    curp: string;

    @IsString()
    @IsNotEmpty()
    rfc: string;

    @IsString()
    @IsOptional()
    discapacidad?: string;

    @IsString()
    @IsNotEmpty()
    puesto: string;

    @IsString()
    @IsNotEmpty()
    area_asignada: string;

    @IsNumber()
    @IsNotEmpty()
    numero_empleado: number;

    @IsNumber()
    @IsNotEmpty()
    id_categoria: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
