
'use client';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Admin Login</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
          {children}
      </main>
      <footer className="bg-muted py-8 mt-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
