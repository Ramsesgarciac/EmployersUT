import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoriaEmpleadoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}   