'use client';
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useClarity } from "@/context/clarity-provider";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export function PublicHeader() {
    const { currentUser } = useClarity();
    const router = useRouter();
    
    return (
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
            <Logo />
            <Button variant="outline" onClick={() => router.push(currentUser ? '/dashboard' : '/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                {currentUser && currentUser.role !== 'Public' ? 'Go to Dashboard' : 'Admin Login'}
            </Button>
        </header>
    )
}
