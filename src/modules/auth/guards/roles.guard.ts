import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_KEY } from '../decorator/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    //('user in roles guard', user);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    //('db user');
    const dbUser = await this.prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: { user_group: true },
    });

    //('db user', dbUser);

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    return requiredRoles.includes(dbUser.user_group);
  }
}
