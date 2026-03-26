"use client";

import { Button } from "@/components/ui/button";

export default function GpsLocationError() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="w-screen h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center text-center gap-6 p-6 max-w-sm">
        
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold">
          Enable Location Services
        </h1>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          We can’t access your location. Please turn on your GPS and allow location permission in your browser to continue.
        </p>

        {/* Steps */}
        <div className="text-xs text-muted-foreground text-left bg-muted p-4 rounded-lg w-full">
          <p className="mb-2 font-medium">How to fix:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Turn on Location (GPS) on your device</li>
            <li>Allow location permission in your browser</li>
            <li>Refresh this page</li>
          </ul>
        </div>

        {/* Button */}
        <Button onClick={handleReload} className="w-full">
          Try Again
        </Button>
      </div>
    </div>
  );
}