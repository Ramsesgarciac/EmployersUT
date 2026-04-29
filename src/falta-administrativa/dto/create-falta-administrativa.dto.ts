import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsDateString,
    Length
} from 'class-validator';

export class CreateFaltaAdministrativaDto {

    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    nombre: string;

    @IsDateString()
    @IsNotEmpty()
    fecha: string;

    @IsString()
    @IsNotEmpty()
    motivo: string;

    @IsString()
    @IsOptional()
    sancion?: string;

    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;
}
