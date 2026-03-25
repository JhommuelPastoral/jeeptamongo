"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");
  const errorMessages: Record<string, string> = {
    AccessDenied: "Access denied. You may not have permission to sign in.",
    OAuthSignin: "Error starting OAuth login.",
    OAuthCallback: "OAuth callback failed.",
    OAuthAccountNotLinked: "Account already exists with a different provider.",
    default: "Something went wrong. Please try again.",
  };

  const message = errorMessages[error ?? ""] || errorMessages.default;

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Card className="max-w-md w-full text-center ring-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-500">
            Authentication Error
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Button onClick={() => signIn()}>
            Try Again
          </Button>

          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}