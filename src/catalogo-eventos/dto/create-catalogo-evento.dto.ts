import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCatalogoEventoDto {
    @IsString()
    @IsNotEmpty()
    nombre_evento: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}