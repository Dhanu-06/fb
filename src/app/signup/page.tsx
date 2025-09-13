import Image from "next/image";
import { SignupForm } from "@/components/auth/signup-form";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function SignupPage() {
  const loginBg = PlaceHolderImages.find(
    (img) => img.id === "login-background"
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
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
      <SignupForm />
    </div>
  );
}
