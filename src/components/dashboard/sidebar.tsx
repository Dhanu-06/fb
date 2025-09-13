'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useClarity } from '@/context/clarity-provider';
import { LayoutDashboard, Wallet, Receipt, LogOut, ShieldCheck, Users } from 'lucide-react';
import { Logo } from '../logo';
import { usePathname, useRouter } from 'next/navigation';

export function MainSidebar() {
  const { currentUser, logout } = useClarity();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Overview',
      roles: ['Admin', 'Reviewer'],
    },
    {
      href: '/dashboard/budgets',
      icon: Wallet,
      label: 'Budgets',
      roles: ['Admin'],
    },
    {
      href: '/dashboard/expenses',
      icon: Receipt,
      label: 'Expenses',
      roles: ['Admin', 'Reviewer'],
    },
  ];
  
  const roleIcons = {
    Admin: <ShieldCheck className="mr-2 h-4 w-4" />,
    Reviewer: <Users className="mr-2 h-4 w-4" />,
    Public: null,
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) =>
            currentUser && item.roles.includes(currentUser.role) ? (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  onClick={() => router.push(item.href)}
                  tooltip={item.label}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        {currentUser && (
            <div className="flex items-center p-2 rounded-md bg-muted text-sm text-muted-foreground">
              {roleIcons[currentUser.role]}
              <div className="flex flex-col">
                <span className="font-semibold">{currentUser.name}</span>
                <span className="text-xs">{currentUser.role}</span>
              </div>
            </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
