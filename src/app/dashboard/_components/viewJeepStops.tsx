"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LoaderCircle } from "lucide-react";

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

export default function ViewJeepStopsButton() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { data: jeeps, isLoading: isJeepsLoading } = useGetJeeps();
  console.log(jeeps);
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
          <DrawerHeader className="pb-4 border-b">
            <DrawerTitle className="text-lg font-semibold text-center">
              Jeep Route Stops
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground text-center">
              View all stops along this jeep route
            </DrawerDescription>
          </DrawerHeader>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {isJeepsLoading ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <LoaderCircle className="w-12 h-12 text-neutral-400 animate-spin" />
                <p className="text-center mt-2">Fetching stops...</p>
              </div>
            ) : jeeps && jeeps.length > 0 ? (
              <div className="space-y-3">
                {jeeps.map((jeep : JeepProps) => (
                  <Collapsible key={jeep.id}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-left hover:bg-accent/10"
                      >
                        {jeep.name}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 px-2 space-y-1 max-h-40 overflow-y-auto ">
                      {jeep.stops.length > 0 ? (
                        jeep.stops.map((s : StopProps) => (
                          <div
                            key={s.stop.id}
                            className="p-2 rounded-lg border bg-muted text-muted-foreground text-sm hover:bg-muted/50 transition"
                          >
                            {s.stop.name}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-center text-muted-foreground">
                          No stops found
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
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