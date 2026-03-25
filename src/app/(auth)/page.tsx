"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from 'lucide-react';
import { signIn } from "next-auth/react"

export default function Login() {
  return (
    <div className="flex justify-center w-screen h-screen items-center">
      <Card className="max-w-md  w-full font-mono ring-0">
        <CardHeader className="flex justify-center items-center flex-col border-none">
          <Shell/>
          <CardTitle className="font-semibold text-lg">Welcome to JeepTa.</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent className="w-full flex justify-center items-center flex-col gap-2 border-none">
          <Button className="w-full" variant={"outline"} onClick={() => signIn("google", {redirectTo: "/dashboard"})}>Sign in with Google</Button>
          <Button className="w-full" variant={"outline"} onClick={() => signIn("github", {redirectTo: "/dashboard"})}>Sign in with GitHub</Button>
        </CardContent>
        <CardFooter className="flex items-center justify-center border-none">
          <CardDescription className="text-center">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </CardDescription>
        </CardFooter>
      </Card>

    </div>
  );
}