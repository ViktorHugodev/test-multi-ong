import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      organizationId: string | null;
    };
    accessToken: string; // JWT token from NestJS backend
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string | null;
    accessToken: string; // JWT token from NestJS backend
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    organizationId: string | null;
    accessToken: string; // JWT token from NestJS backend
  }
}
