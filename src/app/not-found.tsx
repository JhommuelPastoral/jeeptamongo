"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function NotFound() {
  const router = useRouter();
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-b from-gray-900 via-gray-800 to-black text-white px-6">

      <div className="max-w-xl text-center space-y-6">

        {/* Title */}
        <h1 className="text-5xl font-bold tracking-wide">
          404
        </h1>

        {/* Message */}
        <div className="flex  items-center justify-center ">
          <Image
            src="/gif/lost.gif"
            alt="404"
            width={200}
            height={200}
            className="w-full max-w-20 h-auto rounded-lg shadow"
            priority
          />

          <h2 className="text-2xl font-semibold mt-3 text-center">
            Lost in the woods, are you?
          </h2>
        </div>

        <p className="text-gray-400 text-sm">
          The path you’re looking for doesn’t exist… or maybe it never did.
          Try heading back before it gets darker.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <Button className="w-full cursor-pointer" onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    </div>
  );
}