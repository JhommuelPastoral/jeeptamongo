"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo, useTransition, useEffect } from "react";
import type { Map as LeaftletMap } from "leaflet";
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

type Position = [number, number];

type RawPosition ={
  id: string;
  routeId: string;
  stopId: string;
  order: number;
  stop:{
    id: string;
    name: string;
    position: [{lat: number, lng: number}];
  };
  route: {
    id: string;
    name: string;
  };
}

type DirectButtonFunctionProps = {
  setPosition: (position: Position[]) => void;
  mapRef: React.RefObject<LeaftletMap | null>;
}


export default function DirectionButton({setPosition, mapRef}: DirectButtonFunctionProps ) {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const [searchFrom, setSearchFrom] = useState<string>("");
  const [searchTo, setSearchTo] = useState<string>("");

  const [directionFrom, setDirectionFrom] = useState<string>("");
  const [directionTo, setDirectionTo] = useState<string>("");

  const [openListDirectionFrom, setOpenListDirectionFrom] = useState<boolean>(true);
  const [openListDirectionTo, setOpenListDirectionTo] = useState<boolean>(true);

  const [isPending, startTransition] = useTransition();
  const [rawPosition, setRawPosition] = useState<RawPosition[]>([]);
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


  // Filter the jeep stops, send to parent
  useEffect(() => {
    if (rawPosition?.length === 0) return;

    const filtered = rawPosition
      ?.map((raw: RawPosition) => {
        return raw?.stop?.position?.map((pos: { lat: number; lng: number }) => [
          pos?.lat,
          pos?.lng,
        ] as Position) ?? [];
      })
      .flat();
    // Check if filtered is empty
    if (filtered?.length === 0) return;
    mapRef.current?.flyTo(filtered[0], 18);
    setPosition(filtered);
    setOpenDrawer(false);
  }, [rawPosition, setPosition, mapRef]);


  // Convert jeep stops to set for fast search
  const stopNames = useMemo(() => {
    const mapStops = new Map();

    jeepStopsData?.forEach((stop: JeepStopProps) => {
      mapStops.set(stop.name.toLowerCase(), stop.id);
    });
    return mapStops;

  }, [jeepStopsData]);

  const handleSubmit = () => {

    if (!directionFrom || !directionTo) {
      toast.warning("Please select starting point and destination",{
        position: "top-center"
      });
      return;
    }

    // Check if the starting point and destination are the same
    if(directionFrom === directionTo) {
      toast.warning("Starting point and destination cannot be the same",{
        position: "top-center"
      });
      return;
    }

    // check if the input is in the jeepStop Data
    if(!stopNames.has(directionFrom.toLowerCase()) || !stopNames.has(directionTo.toLowerCase())) {
      toast.warning("Select a valid starting point and destination",{
        position: "top-center"
      });
      return;
    }

    findRouteMutate(
      { fromDirection: directionFrom, toDirection: directionTo },
      {
        onSuccess: (data) => {
          toast.success("Route found successfully", {
          position: "top-center"
        });
          setRawPosition(data?.route);
        },
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

        <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)] flex flex-col h-full max-h-[85svh] z-1003">
          <DrawerHeader className="px-0">
            <DrawerTitle>Direction</DrawerTitle>
            <DrawerDescription>
              Choose your starting point and destination
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 mt-2 overflow-y-auto flex-1 min-h-0 h-full">
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
                    <CommandList className="max-h-40 h-full">
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
                    <CommandList className="max-h-40 h-full">
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