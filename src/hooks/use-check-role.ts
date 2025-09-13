'use client';

import { useClarity } from '@/context/clarity-provider';
import type { Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from './use-toast';

export function useCheckRole(requiredRoles: Role[]) {
  const { currentUser } = useClarity();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
        variant: 'destructive',
      });
      router.replace('/login');
      return;
    }

    if (!requiredRoles.includes(currentUser.role)) {
       toast({
        title: 'Access Denied',
        description: "You don't have permission to view this page.",
        variant: 'destructive',
      });
      if (currentUser.role === 'Public') {
        router.replace('/public');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, router, requiredRoles]);

  const hasRequiredRole = currentUser && requiredRoles.includes(currentUser.role);
  
  return { currentUser: hasRequiredRole ? currentUser : null, isLoading: !currentUser };
}
