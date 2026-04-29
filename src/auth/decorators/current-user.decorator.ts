import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Te permite obtener el usuario logueado en cualquier controller así:
// @Get('perfil')
// getPerfil(@CurrentUser() user) { return user; }

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);