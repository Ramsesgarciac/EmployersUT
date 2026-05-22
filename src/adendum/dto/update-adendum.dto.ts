import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateAdendumDto {
    @IsDateString()
    @IsOptional()
    fecha_inicio?: string;

    @IsDateString()
    @IsOptional()
    fecha_fin?: string;

    @IsBoolean()
    @IsOptional()
    vigente?: boolean;
}
