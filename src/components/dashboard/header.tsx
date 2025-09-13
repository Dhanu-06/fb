'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { useClarity } from '@/context/clarity-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Currency } from '@/lib/types';

export function Header() {
  const pathname = usePathname();
  const { currency, setCurrency } = useClarity();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);

    return (
      <React.Fragment key={href}>
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{name}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href}>{name}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
       <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbItems}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">INR (₹)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
