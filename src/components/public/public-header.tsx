'use client';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Institution } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PublicHeaderProps {
    institutions: Institution[];
    selectedInstitutionId: string;
    onInstitutionChange: (id: string) => void;
}

export function PublicHeader({ institutions, selectedInstitutionId, onInstitutionChange }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-4">
          <Select value={selectedInstitutionId} onValueChange={onInstitutionChange}>
            <SelectTrigger className="w-[180px] sm:w-[250px]">
              <SelectValue placeholder="Select an Institution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutions</SelectItem>
              {institutions.map(inst => (
                <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
