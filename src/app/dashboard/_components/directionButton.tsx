"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo, useTransition } from "react";

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

import { LoaderCircle } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useGetJeepStops } from "@/apiHandler/jeepStopApiHandler";
import { useFindRoute } from "@/apiHandler/findRouteApiHandler";
import { toast } from "sonner";

type JeepStopProps = {
  id: string;
  name: string;
};

export default function DirectionButton() {
  const [openDrawer, setOpenDrawer] = useState(false);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const [directionFrom, setDirectionFrom] = useState("");
  const [directionTo, setDirectionTo] = useState("");

  const [openListDirectionFrom, setOpenListDirectionFrom] = useState(true);
  const [openListDirectionTo, setOpenListDirectionTo] = useState(true);

  const [isPending, startTransition] = useTransition();

  const { data: jeepStopsData, isLoading, isError } = useGetJeepStops();
  const { mutate: findRouteMutate, isPending: findRouteLoading } = useFindRoute();

  // FILTER + LIMIT For Optimization since we do have a lot of data.
  const filteredFromStops = useMemo(() => {
    return jeepStopsData
      ?.filter((stop: JeepStopProps) =>
        stop.name.toLowerCase().includes(directionFrom.toLowerCase())
      )
      .slice(0, 20);
  }, [jeepStopsData, directionFrom]);

  const filteredToStops = useMemo(() => {
    return jeepStopsData
      ?.filter((stop: JeepStopProps) =>
        stop.name.toLowerCase().includes(directionTo.toLowerCase())
      )
      .slice(0, 20);
  }, [jeepStopsData, directionTo]);

  const handleSubmit = () => {
    if (!directionFrom || !directionTo) {
      toast.warning("Please select starting point and destination");
      return;
    }

    findRouteMutate(
      { fromDirection: directionFrom, toDirection: directionTo },
      {
        onSuccess: () => toast.success("Route found successfully", {
          position: "top-center"
        }),
        onError: () => toast.error("Error finding route",{
          position: "top-center"
        }),
      },
    );
  };

  return (
    <div>
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} fixed>
        <DrawerTrigger asChild>
          <Button>Get Direction</Button>
        </DrawerTrigger>

        <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)] flex flex-col z-1003">
          <DrawerHeader className="px-0">
            <DrawerTitle>Direction</DrawerTitle>
            <DrawerDescription>
              Choose your starting point and destination
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 mt-2 overflow-y-auto flex-1">
            {/* FROM */}
            <div>
              <p className="text-sm font-medium">From:</p>
              <div className="border rounded-lg ">
                <Command>
                  <CommandInput
                    placeholder="Search location..."
                    value={searchFrom}
                    disabled={isLoading || isError}
                    onValueChange={(value) => {
                      setSearchFrom(value);

                      startTransition(() => {
                        setDirectionFrom(value);
                      });

                      setOpenListDirectionFrom(true);
                      setOpenListDirectionTo(false);
                    }}
                  />

                  {openListDirectionFrom && (
                    <CommandList className="max-h-40">
                      {isLoading && <div className="p-2">Loading...</div>}
                      {isError && <div className="p-2 text-red-500">Error</div>}

                      {!isLoading && !isError && (
                        <>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {filteredFromStops?.map((stop : JeepStopProps) => (
                              <CommandItem
                                key={stop.id}
                                value={stop.name}
                                onSelect={(value) => {
                                  setDirectionFrom(value);
                                  setSearchFrom(value);
                                  setOpenListDirectionFrom(false);
                                }}
                              >
                                {stop.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}

                      {isPending && (
                        <div className="p-2 text-xs text-muted-foreground">
                          Filtering...
                        </div>
                      )}
                    </CommandList>
                  )}
                </Command>
              </div>
            </div>

            {/* TO */}
            <div>
              <p className="text-sm font-medium">To:</p>
              <div className="border rounded-lg">
                <Command>
                  <CommandInput
                    placeholder="Search location..."
                    value={searchTo}
                    disabled={isLoading || isError}
                    onValueChange={(value) => {
                      setSearchTo(value);

                      startTransition(() => {
                        setDirectionTo(value);
                      });

                      setOpenListDirectionTo(true);
                      setOpenListDirectionFrom(false);
                    }}
                  />

                  {openListDirectionTo && (
                    <CommandList className="max-h-40">
                      {!isLoading && !isError && (
                        <>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {filteredToStops?.map((stop : JeepStopProps) => (
                              <CommandItem
                                key={stop.id}
                                value={stop.name}
                                onSelect={(value) => {
                                  setDirectionTo(value);
                                  setSearchTo(value);
                                  setOpenListDirectionTo(false);
                                }}
                              >
                                {stop.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}

                      {isPending && (
                        <div className="p-2 text-xs text-muted-foreground">
                          Filtering...
                        </div>
                      )}
                    </CommandList>
                  )}
                </Command>
              </div>
            </div>
          </div>

          <DrawerFooter className="px-0 mt-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!directionFrom || !directionTo || findRouteLoading}
            >
              {findRouteLoading ? "Finding Route..." : "Find Route"}
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