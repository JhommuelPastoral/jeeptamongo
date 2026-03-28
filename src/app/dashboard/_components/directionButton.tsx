"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LoaderCircle } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {useGetJeepStops} from "@/apiHandler/jeepStopApiHandler";
import { useFindRoute } from "@/apiHandler/findRouteApiHandler";
import { toast } from "sonner";

type JeepStopPros ={
  id: string;
  name: string;
}

export default function DirectionButton() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [directionFrom, setDirectionFrom] = useState("");
  const [directionTo, setDirectionTo] = useState("");
  const [openListDirectionFrom, setOpenListDirectionFrom] = useState(true);
  const [openListDirectionTo, setOpenListDirectionTo] = useState(true);

  
  // Fetch jeep stops
  const { data: jeepStopsData, isLoading: jeepStopsLoading, isError: jeepStopsError } = useGetJeepStops();
  const { mutate: findRouteMutate, isPending: findRouteLoading } = useFindRoute();

  const handleSubmit = async () => {
    if (!directionFrom || !directionTo) {
      toast.warning("Please select starting point and destination", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#6388F8",
          color: "#ffff",
        }
      });
      return;
    }

    findRouteMutate({fromDirection: directionFrom, toDirection: directionTo}, {
      onSuccess: () => {
        toast.success("Route found successfully", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#6388F8",
            color: "#ffff",
          }
        });
      },
      onError: () => {
        toast.error("Error finding route", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#6388F8",
            color: "#ffff",
          }
        });
      }
    });

    // setOpenDrawer(false);
  };

  return (
    <div>
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerTrigger asChild>
          <Button className="cursor-pointer">Get Direction</Button>
        </DrawerTrigger>

        <DrawerContent className="px-4 pb-6 z-1001">
          {/* Handle */}
          <div className="mx-auto mt-2 h-1 w-30 rounded-full bg-gray-400" />

          <DrawerHeader className="px-0">
            <DrawerTitle>Direction</DrawerTitle>
            <DrawerDescription>
              Choose your starting point and destination
            </DrawerDescription>
          </DrawerHeader>

          {/* FORM */}
          <div className="space-y-4 mt-2 no-scrollbar overflow-y-auto">
            {/* FROM */}
            <div className="space-y-2">
              <p className="text-sm font-medium">From:</p>
              <div className="border rounded-lg overflow-hidden">
                <Command>
                  <CommandInput
                    placeholder="Search location..."
                    disabled={jeepStopsLoading || jeepStopsError}
                    value={directionFrom}
                    onValueChange={(value) => {
                      setOpenListDirectionFrom(true);
                      setDirectionFrom(value);
                    }}
                  />

                  {openListDirectionFrom && (
                    <CommandList className="max-h-40">
                      {jeepStopsLoading && (
                        <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                          <LoaderCircle className="w-4 h-4 text-muted-foreground animate-spin" />
                          Loading Jeepney Stops ... 
                        </div>
                      )}

                      {jeepStopsError && (
                        <div className="p-3 text-sm text-red-500">
                          Failed to load stops
                        </div>
                      )}
                      {!jeepStopsLoading && !jeepStopsError && (
                        <>
                          <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                              {jeepStopsData?.map((stop: JeepStopPros) => (
                                <CommandItem
                                  key={stop.id}
                                  value={stop.name}
                                  onSelect={(value) => {
                                    setDirectionFrom(value);
                                    setOpenListDirectionFrom(false);
                                  }}
                                >
                                  {stop.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  )}
                </Command>
              </div>
            </div>
            {/* TO */}
            <div className="space-y-2">
              <p className="text-sm font-medium">TO:</p>
              <div className="border rounded-lg overflow-hidden">
                <Command>
                  <CommandInput
                    placeholder="Search location..."
                    value={directionTo}
                    disabled={jeepStopsLoading || jeepStopsError}
                    onValueChange={(value)=> {
                      setOpenListDirectionTo(true);
                      setDirectionTo(value);
                    }}
                  />
                  {openListDirectionTo && (
                    <CommandList className="max-h-40">
                      {jeepStopsLoading && (
                        <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                          <LoaderCircle className="w-4 h-4 text-muted-foreground animate-spin" />
                          Loading Jeepney Stops ... 
                        </div>
                      )}

                      {jeepStopsError && (
                        <div className="p-3 text-sm text-red-500">
                          Failed to load stops
                        </div>
                      )}                    
                      {!jeepStopsLoading && !jeepStopsError && (
                        <>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {jeepStopsData?.map((stop: JeepStopPros) => (
                              <CommandItem
                                key={stop?.id}
                                value={stop?.name}
                                onSelect={(value) => {
                                  setDirectionTo(value);
                                  setOpenListDirectionTo(false);
                                }}
                              >
                                {stop?.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}

                    </CommandList>
                  )}
                </Command>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <DrawerFooter className="px-0 mt-4">
            <Button className="w-full" onClick={handleSubmit} disabled ={!directionFrom || !directionTo || findRouteLoading}>
              {findRouteLoading ? 
                <div className="flex items-center gap-2">
                  <LoaderCircle className="w-4 h-4 text-muted-foreground animate-spin" />
                  Finding Route ...
                </div> :
                <p>
                  Find Route
                </p>

              }

            </Button>

            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}