import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDocEmpleadoDto {
    @IsNumber()
    @IsNotEmpty()
    id_empleado: number;

    @IsNumber()
    @IsNotEmpty()
    id_tipo_doc: number;
}