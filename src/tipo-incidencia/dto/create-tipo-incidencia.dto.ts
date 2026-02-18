import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTipoIncidenciaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}
