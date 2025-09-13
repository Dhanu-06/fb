'use client';
import { Logo } from "@/components/logo";
import { PublicDashboard } from "@/components/dashboard/public/public-dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useClarity } from "@/context/clarity-provider";

export default function PublicPage() {
    const { currentUser, getInstitutionById } = useClarity();
    const institution = currentUser ? getInstitutionById(currentUser.institutionId) : null;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Logo />
                <div className="flex items-center gap-4">
                    {institution && <p className="text-sm text-muted-foreground hidden sm:block">Viewing as: <span className="font-semibold text-foreground">{institution.name}</span></p>}
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="container mx-auto">
                    <PublicDashboard />
                </div>
            </main>
            <footer className="bg-muted py-8">
                <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
