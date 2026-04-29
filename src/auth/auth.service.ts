import {
    Injectable, UnauthorizedException,
    ConflictException, NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<{ message: string; user: Partial<User> }> {
        const existe = await this.userRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ],
        });

        if (existe) {
            throw new ConflictException('Ya existe un usuario con ese username o email');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = this.userRepository.create({
            ...createUserDto,
            password: passwordHash,
        });

        const guardado = await this.userRepository.save(user);

        const { password, ...result } = guardado;
        return { message: 'Usuario creado exitosamente', user: result };
    }

    async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
        const user = await this.userRepository.findOne({
            where: { username: loginDto.username, activo: true },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const passwordValido = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordValido) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // 👇 Payload del token — cuando agregues permisos por rol, incorpóralos aquí
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const { password, ...userData } = user;

        return {
            access_token: this.jwtService.sign(payload),
            user: userData,
        };
    }

    async findAll(): Promise<Partial<User>[]> {
        const users = await this.userRepository.find({
            select: ['id', 'username', 'email', 'role', 'activo', 'fecha_creacion'],
            order: { id: 'DESC' },
        });
        return users;
    }

    async deactivate(id: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        user.activo = false;
        await this.userRepository.save(user);
        return { message: 'Usuario desactivado correctamente' };
    }
}