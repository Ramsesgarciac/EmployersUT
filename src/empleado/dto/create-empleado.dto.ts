import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Length, Matches } from 'class-validator';

export class CreateEmpleadoDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @Length(18, 18, { message: 'CURP debe tener exactamente 18 caracteres' })
    @Matches(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/, {
        message: 'CURP con formato inválido. Ejemplo: ABCD123456HDFABC01'
    })
    curp: string;

    @IsString()
    @IsNotEmpty()
    @Length(12, 13, { message: 'RFC debe tener 12 o 13 caracteres' })
    @Matches(/^[A-ZÑ&]{3,4}[0-9]{6}[0-9A-Z]{3}$/, {
        message: 'RFC con formato inválido. Ejemplo: ABC123456ABC o ABCD123456ABC'
    })
    rfc: string;

    @IsString()
    @IsOptional()
    @Length(1, 100)
    discapacidad?: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    puesto: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    area_asignada: string;

    @IsNumber()
    @IsNotEmpty()
    numero_empleado: number;

    @IsNumber()
    @IsNotEmpty()
    id_categoria: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
