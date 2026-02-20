import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateTipoDocDto {
    @IsString()
    @IsNotEmpty()
    nombre_doc: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsBoolean()
    @IsNotEmpty()
    obligatorio: boolean;

    @IsNumber()
    @IsNotEmpty()
    orden: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}