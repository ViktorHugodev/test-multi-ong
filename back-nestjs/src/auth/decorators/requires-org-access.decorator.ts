import { SetMetadata } from '@nestjs/common';

export const RequiresOrgAccess = () => SetMetadata('requiresOrgAccess', true);
