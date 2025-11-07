export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'ong_manager' | 'ong_staff' | 'customer';
  organizationId: string | null;
  organization?: Organization;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: string;
  organization?: Organization;
}
