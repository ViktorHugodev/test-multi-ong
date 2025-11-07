import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard to enforce multi-tenancy isolation
 * Ensures users can only access resources from their own organization
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresOrgAccess = this.reflector.getAllAndOverride<boolean>(
      'requiresOrgAccess',
      [context.getHandler(), context.getClass()],
    );

    // Skip check if decorator not applied
    if (!requiresOrgAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin can access all organizations
    if (user?.role === 'admin') {
      return true;
    }

    // Check if user has organization
    if (!user?.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    // Store organizationId in request for controllers to use
    request.organizationId = user.organizationId;

    return true;
  }
}
