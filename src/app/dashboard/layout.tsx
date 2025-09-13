
'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useCheckRole } from '@/hooks/use-check-role';
import { useClarity } from '@/context/clarity-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useClarity();
  const { hasRequiredRole } = useCheckRole(['Admin', 'Reviewer', 'Public']);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [isLoading, currentUser, router]);

  // Updated loading UI to match the public page.
  if (isLoading || !hasRequiredRole) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
