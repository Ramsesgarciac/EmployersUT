import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // 👈 Agregar
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService, // 👈 Inyectar ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') ?? 'secret_cambiar_en_produccion',
            // 👆 El ?? garantiza que nunca sea undefined
        });
    }

    async validate(payload: { sub: number; username: string; role: string }) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub, activo: true },
        });

        if (!user) {
            throw new UnauthorizedException('Token inválido o usuario inactivo');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }
}