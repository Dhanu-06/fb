
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Landmark, FileCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
    const heroBg = PlaceHolderImages.find(p => p.id === 'public-banner');
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-4">
             <Button variant="ghost" asChild>
                <Link href="/public">Public Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-primary/10">
           {heroBg && <Image 
                src={heroBg.imageUrl} 
                alt={heroBg.description}
                data-ai-hint={heroBg.imageHint}
                fill
                className="object-cover opacity-10"
           />}
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Financial Transparency for Modern Institutions
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              ClarityLedger provides a clear, verifiable, and real-time view into your
              organization's fund allocation and expenditures.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/public">View Public Data</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Why ClarityLedger?
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Empowering trust through unparalleled transparency and accountability.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                  <Landmark className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Centralized Budgets</h3>
                <p className="mt-2 text-muted-foreground">
                  Manage budgets for all departments from a single, unified platform.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                   <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Verifiable Expenses</h3>
                <p className="mt-2 text-muted-foreground">
                  Every expense is backed by a digital proof, reviewed, and logged in an immutable audit trail.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                   <Eye className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Public Transparency</h3>
                <p className="mt-2 text-muted-foreground">
                  Provide a read-only public dashboard to build trust with stakeholders and the community.
                </p>
              </div>
            </div>
          </div>
        </section>

         {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Bring Clarity to Your Finances?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Sign up today to start managing your funds with complete transparency.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
