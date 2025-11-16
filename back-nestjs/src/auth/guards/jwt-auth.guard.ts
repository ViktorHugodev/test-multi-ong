import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Se a rota é pública, não exigir autenticação
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user; // Retorna user se existir, ou undefined se não existir (mas não lança erro)
    }

    // Para rotas protegidas, validar token
    if (err) {
      throw err;
    }

    if (!user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token expired');
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid JWT token');
      }

      if (info?.message) {
        throw new UnauthorizedException(`Authentication failed: ${info.message}`);
      }

      throw new UnauthorizedException('Missing or invalid authentication token');
    }

    return user;
  }
}
