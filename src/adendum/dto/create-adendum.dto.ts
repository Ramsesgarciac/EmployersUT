import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAdendumDto {
    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;

    @IsDateString()
    @IsNotEmpty()
    fecha_inicio: string;

    @IsDateString()
    @IsNotEmpty()
    fecha_fin: string;
}
