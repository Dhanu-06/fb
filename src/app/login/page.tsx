import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(
    (img) => img.id === "login-background"
  );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {loginBg && (
        <Image
          src={loginBg.imageUrl}
          alt={loginBg.description}
          data-ai-hint={loginBg.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <LoginForm />
      <div className="absolute bottom-8 z-10 rounded-lg border bg-card/80 p-4 text-center text-card-foreground shadow-lg backdrop-blur-sm">
        <p className="mb-2">Or, view the public transparency dashboard directly.</p>
        <Button asChild>
          <Link href="/public">
            Go to Public Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
