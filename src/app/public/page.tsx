
import { PublicDashboard } from '@/components/dashboard/public/public-dashboard';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PublicPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
       <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/login">
                Admin / Reviewer Login
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>
        <PublicDashboard />
      </main>
       <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
