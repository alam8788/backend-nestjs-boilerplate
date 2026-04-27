import { SetMetadata } from '@nestjs/common';

export const Auth = (...args: string[]) => SetMetadata('auth', args);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
