"use client";

import { Button } from "@/components/ui/button";
import { useState, memo, useCallback } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { LoaderCircle } from "lucide-react";
import { ChevronDown } from 'lucide-react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";


import { useGetJeeps } from "@/apiHandler/getJeepApiHandler";

type JeepProps = {
  name: string;
  id: string;
  stops: StopProps[];
};

type StopProps = {
  stop: {
    id: string;
    name: string;
  };
};

// Memoized component for rendering a single Jeep route stop item.
// This component is memoized to improve performance by avoiding unnecessary re-renders
// when the list of stops is large.
// If we dont Memo this component, it will re-render every time, Imagine re render 60 Jeeps, with let say 50-100 stops
// so we use Memo here so that, only the component that is open is re-rendered when we click on it
const JeepItemComponent = memo(function JeepItemComponent({
  jeep,
  isOpen,
  onToggle,
}: {
  jeep: JeepProps;
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <Collapsible key={jeep.id} open={isOpen} onOpenChange={() => onToggle(jeep.id)}>
      <CollapsibleTrigger asChild>
        <Button className="w-full flex items-center justify-between">
          <p>{jeep.name}</p>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 px-2 space-y-2 max-h-50 overflow-y-auto">
        {jeep.stops.map((s: StopProps) => (
          <div key={s.stop.id} className="p-2 border">
            {s.stop.name}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

export default function ViewJeepStopsButton() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { data: jeeps, isLoading: isJeepsLoading, isError: isJeepsError, refetch: refetchJeeps, isFetching: isJeepsFetching } = useGetJeeps();
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  },[]);

  return (
    <div className="w-full">
      <Drawer
        direction="left"
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        dismissible={false}
      >
        {/* Trigger Button */}
        <DrawerTrigger asChild>
          <Button className="w-full font-medium">View Stops</Button>
        </DrawerTrigger>

        {/* Drawer */}
        <DrawerContent className="z-1002 max-w-sm w-full">
          {/* Header */}
          <DrawerHeader className="pb-2 border-b">
            <DrawerTitle className="font-semibold text-center">
              Jeep Route Stops
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground text-center">
              View all stops along this jeep route
            </DrawerDescription>
          </DrawerHeader>
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {isJeepsLoading|| isJeepsFetching? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <LoaderCircle className="w-12 h-12 text-neutral-400 animate-spin" />
                <p className="text-center mt-2">Fetching stops...</p>
              </div>
            ) : isJeepsError ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-center text-red-500">
                  ❌ Failed to fetch jeeps. Please try again.
                </p>
                <Button variant={"outline"} onClick={() => refetchJeeps()}>Retry</Button>
              </div>
            ) : jeeps && jeeps.length > 0 ? (
              <div className="space-y-2">
                {jeeps.map((jeep: JeepProps) => {
                  const isOpen = openId === jeep.id;
                  return (
                    <JeepItemComponent
                      key={jeep.id}
                      jeep={jeep}
                      isOpen={isOpen}
                      onToggle={handleToggle}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-center text-muted-foreground">
                  No jeeps found
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <DrawerFooter className="border-t pt-3">
            <DrawerClose asChild>
              <Button
                className="w-full"
                onClick={() => setOpenDrawer(false)}
              >
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}