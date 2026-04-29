import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST /auth/register
    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    // POST /auth/login
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // GET /auth/perfil  → requiere token
    @UseGuards(JwtAuthGuard)
    @Get('perfil')
    getPerfil(@CurrentUser() user) {
        return user;
    }

    // GET /auth/usuarios  → requiere token
    @UseGuards(JwtAuthGuard)
    @Get('usuarios')
    findAll() {
        return this.authService.findAll();
    }

    // PATCH /auth/usuarios/:id/desactivar  → requiere token
    @UseGuards(JwtAuthGuard)
    @Patch('usuarios/:id/desactivar')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.authService.deactivate(id);
    }
}