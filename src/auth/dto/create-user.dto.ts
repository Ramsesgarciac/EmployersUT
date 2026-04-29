import {
    IsString, IsNotEmpty, IsEmail,
    MinLength, IsEnum, IsOptional
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsEnum(UserRole, { message: 'Rol inválido' })
    @IsOptional()
    role?: UserRole;
    // 👆 Cuando agregues roles, solo se agregan al enum UserRole
}