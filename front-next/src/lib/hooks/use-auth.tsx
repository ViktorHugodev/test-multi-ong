'use client';

import { useAuthNextAuth } from './use-auth-nextauth';

export function useAuth() {
  return useAuthNextAuth();
}
