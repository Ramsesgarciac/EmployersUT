import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJustificanteDto {
    @IsNumber()
    @IsNotEmpty()
    id_incidencia: number;
}