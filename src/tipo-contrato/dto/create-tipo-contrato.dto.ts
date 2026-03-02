import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTipoContratoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}