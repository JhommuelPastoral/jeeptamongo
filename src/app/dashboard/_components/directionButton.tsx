"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
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
import SelectJeepRouteModal from "./selectJeepRouteModal";
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

type RouteSimplified = {
  jeepName: string;
  color: string;
  stop: {
    name: string;
    position: {
      lat: number;
      lng: number;
    }[];
  };
}

type DirectButtonFunctionProps = {
  setPosition: (position: Position[]) => void;
  mapRef: React.RefObject<LeaftletMap | null>;
  setRouteMap: (routeMap: Map<string, RouteMap>) => void;
}

type RouteMap = {
  jeepName: string;
  color: string;
  position: Position[];
}


export default function DirectionButton({setPosition, mapRef, setRouteMap}: DirectButtonFunctionProps ) {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const [searchFrom, setSearchFrom] = useState<string>("");
  const [searchTo, setSearchTo] = useState<string>("");

  const [directionFrom, setDirectionFrom] = useState<string>("");
  const [directionTo, setDirectionTo] = useState<string>("");

  const [openListDirectionFrom, setOpenListDirectionFrom] = useState<boolean>(true);
  const [openListDirectionTo, setOpenListDirectionTo] = useState<boolean>(true);

  const [isPending, startTransition] = useTransition();
  const [rawPosition, setRawPosition] = useState<RouteSimplified[]>([]);
  const { data: jeepStopsData, isLoading, isError } = useGetJeepStops();
  const { mutate: findRouteMutate, isPending: findRouteLoading } = useFindRoute();

  const [openSelectModal, setOpenSelectModal] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<RouteMap[]>([]);


  // FILTER + LIMIT For Optimization since we do have a lot of data.
  const filteredFromStops = useMemo(() => {
    return jeepStopsData
      ?.filter((stop: JeepStopProps) => {
          if(stop.name !== "Connector"){
            return stop.name.toLowerCase().includes(directionFrom.toLowerCase())
          }
        }
      )
      .slice(0, 20);
  }, [jeepStopsData, directionFrom]);

  const filteredToStops = useMemo(() => {
    return jeepStopsData
      ?.filter((stop: JeepStopProps) =>{
          if(stop.name !== "Connector"){
            return stop.name.toLowerCase().includes(directionTo.toLowerCase())
          }
        }
      )
      .slice(0, 20);
  }, [jeepStopsData, directionTo]);

  // Normalize the raw position data to be used in the map
  const filteredRawPosition = useMemo(() => {
    const filtered = rawPosition
      ?.map((raw: RouteSimplified) => {
        return raw?.stop?.position?.map((pos: { lat: number; lng: number }) => [
          pos?.lat,
          pos?.lng,
        ] as Position) ?? [];
      }).flat();
    return filtered;
  },[rawPosition]);

  const routeMap  = useMemo(() => {
    const map = new Map<string, RouteMap>();
    rawPosition?.forEach((raw: RouteSimplified) => {
      const positions = raw?.stop?.position?.map((pos: { lat: number; lng: number }) => [pos?.lat,pos?.lng,] as Position) ?? [];
      if(!map.has(raw?.jeepName)){
        map.set(raw?.jeepName, {
          jeepName: raw?.jeepName,
          color: raw?.color,
          position: positions
        });
      }
      else{
        const existing = map.get(raw?.jeepName);
        if(existing) {
          existing.position = [...existing.position, ...positions];
        }
      }

    });
    return map;
  }, [rawPosition]);

  // Filter the jeep stops, send to parent
  useEffect(() => {
    if (rawPosition?.length === 0) return;
    // Check if filtered is empty
    if (filteredRawPosition?.length === 0 || routeMap.size === 0) {
      toast.error("Route not found", {
        position: "top-center",
      });
      return;
    };
    if (routeMap.size > 1) {
      // convert map → array for modal
      setSelectedRoutes(Array.from(routeMap.values()));
      setOpenSelectModal(true);
      setOpenDrawer(false);
      return; 
    }

    mapRef.current?.flyTo(filteredRawPosition[0], 18);
    setPosition(filteredRawPosition);
    setRouteMap(routeMap);
    setOpenDrawer(false);
  }, [rawPosition, setPosition, mapRef]);


  const handleSelectRoute = useCallback((route: RouteMap) => {
    const newMap = new Map<string, RouteMap>();
    newMap.set(route.jeepName, route);

    mapRef.current?.flyTo(route.position[0], 18);
    setPosition(route.position);
    setRouteMap(newMap);

    setOpenSelectModal(false);
    setOpenDrawer(false);
  }, [selectedRoutes]);

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
        onError: (data) => toast.error(data?.message ?? "Error finding route",{
          position: "top-center"
        }),
      },
    );    
         
  };

  return (
    <div className="w-full">
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} repositionInputs={false}>
        <DrawerTrigger asChild>
          <Button className="w-full">Get Direction</Button>
        </DrawerTrigger>

        <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)] flex flex-col max-h-[85svh] z-1003">
          <DrawerHeader className="px-0">
            <DrawerTitle>Direction</DrawerTitle>
            <DrawerDescription>
              Choose your starting point and destination
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 mt-2 overflow-y-auto flex-1 min-h-0">
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
              {findRouteLoading ? (
                <div className="flex items-center gap-2">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Finding Route... 
                </div>

              ) : "Find Route"} 
            </Button>

            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <SelectJeepRouteModal
        open={openSelectModal}
        onClose={setOpenSelectModal}
        routes={selectedRoutes}
        onSelect={handleSelectRoute}
      />
    </div>
  );
}