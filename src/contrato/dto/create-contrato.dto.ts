import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadContratoDto {
    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;

    @IsNumber()
    @IsNotEmpty()
    id_tipo_contrato: number;

    @Type(() => Date)
    @IsNotEmpty()
    fecha_inicio: Date;

    @Type(() => Date)
    @IsNotEmpty()
    fecha_fin: Date;
}