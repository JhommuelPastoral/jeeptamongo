"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState, useRef } from "react";
import Loading from "../loading";
import harversineFormula from "@/helpers/harversineFormula";
import type { Map as LeaftletMap } from "leaflet";
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer),{ ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer),{ ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker),{ ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline),{ ssr: false });
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EnableLocationPermissionError from "./_components/enableLocationPermissionError";
import DirectionButton from "./_components/directionButton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type Location = {
  lat: number;
  lng: number;
};

type Position = [number, number];

export default function Dashboard() {
  const [currentPosition, setCurrentPosition] = useState<Location>({ lat: 0, lng: 0 });
  const prevTimeRef = useRef<number>(0);
  const prevPositionRef = useRef<Location>({ lat: 0, lng: 0 });
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const { data: session } = useSession(); // Session for the user jwt
  const [theme, setTheme] = useState<string>("");
  const mapRef = useRef<LeaftletMap | null>(null);
  const [gpsError, setGpsError] = useState(false);
  const [position, setPosition] = useState<Position[]>([]);

  // Get current position
  useEffect(() => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;

          const prevTime = prevTimeRef.current;
          const prevPosition = prevPositionRef.current;

          if (prevTime !== 0) {
            const distance = harversineFormula(
              prevPosition.lat,
              prevPosition.lng,
              newLat,
              newLng
            );

            const timeDiff = (position.timestamp - prevTime) / 1000;

            if (timeDiff > 0) {
              const speedMps = distance / timeDiff;
              const speedKmh = speedMps * 3.6;

              // Optional smoothing (reduce GPS jitter)
              const smoothedSpeed = speedKmh < 1 ? 0 : Number(speedKmh.toFixed(2));

              setCurrentSpeed(position.coords.speed ?? smoothedSpeed);
            }
          }

          setCurrentPosition({
            lat: newLat,
            lng: newLng,
          });

          // update refs
          prevTimeRef.current = position.timestamp;
          prevPositionRef.current = {
            lat: newLat,
            lng: newLng,
          };
          setGpsError(false);
        },
        (error) => {
          if (
            error.code === error.PERMISSION_DENIED ||
            error.code === error.POSITION_UNAVAILABLE
          ) {
            console.log("Location error: ", error.code);
            setGpsError(true); // Trigger the error
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }, []);

  // Get Theme
  useEffect(() => {
    setTheme(localStorage.getItem("jeepTa-Theme") || "light");
  }, []);

  // Change Theme
  const handleThemeChange = () => {
    // Get From the local storage
    if(localStorage.getItem("jeepTa-Theme") === "dark"){
      localStorage.setItem("jeepTa-Theme", "light");
      setTheme("light");
    } else {
      localStorage.setItem("jeepTa-Theme", "dark");
      setTheme("dark");
    }
  };

  // Set View
  const handleSetView = () => {
    if(mapRef.current){
      mapRef.current.flyTo([currentPosition.lat, currentPosition.lng], 14);
    }
  };
  console.log(position);

  if(gpsError) return <EnableLocationPermissionError />

  if (currentPosition.lat === 0 && currentPosition.lng === 0) {
    return <Loading title="map"/>;
  }
  if(!session) return <Loading title="session" />
  return (
    <div className="w-screen h-dvh relative">
      {/* Map */}
      <Suspense fallback={<Loading title="map" />}>
        <MapContainer
          center={[currentPosition.lat, currentPosition.lng]}
          zoom={14}
          className="w-full h-full z-0"
          zoomControl={false}
          attributionControl={false}
          maxBounds={[[6.8, 125.1],[7.3, 125.8]]}
          maxBoundsViscosity={1}
          minZoom={12}
          maxZoom={18}
          ref={mapRef}
        >
          <TileLayer url={`https://{s}.basemaps.cartocdn.com/${theme}_all/{z}/{x}/{y}{r}.png`} />
          <CircleMarker
            center={[currentPosition.lat, currentPosition.lng]}
            radius={5}
            pathOptions={{
              color: theme === "dark" ? "white" : "black",
              fillColor: theme === "dark" ? "white" : "black",
              fillOpacity: 1,
            }}
            className="animate-pulse"
          />        
          {position && (
            <Polyline 
              positions={position}
              color={theme === "dark" ? "white" : "black"}
              weight={3}
            />
          )}
        </MapContainer>   
      </Suspense>

      {/* Top Left Corner Details */}
      <div className="absolute top-0 left-0 z-1000">
        <div className="flex flex-col items-start gap-2 p-4">
          <div className="flex items-start gap-2 flex-col">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <p className={`${theme === "dark" ? "text-white" : "text-black"} text-sm`}>Current Position</p>
            </div>
            <p className={`${theme === "dark" ? "text-white" : "text-black"} text-sm`}>Latitude: {currentPosition.lat.toFixed(5)}</p>
            <p className={`${theme === "dark" ? "text-white" : "text-black"} text-sm`}>Longitude: {currentPosition.lng.toFixed(5)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`${theme === "dark" ? "bg-white" : "bg-black"} w-2 h-2 rounded-full`} />
            <p className={`${theme === "dark" ? "text-white" : "text-black"} text-sm`}>Current Speed: {currentSpeed.toFixed(5)} m/s </p>
          </div>
        </div>
      </div>
      
      {/* Top Right Corner Profile Details */}
      <div className="absolute top-0 right-0 z-1000">
        <div className="flex flex-col items-start gap-2 p-4 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                <HoverCard openDelay={10} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Avatar >
                      <AvatarImage src={session?.user?.image ?? ""} alt="User Profile" />
                      <AvatarFallback className="bg-amber-400 text-black">{session?.user?.name?.charAt(0) || ""}</AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent side="left" align="center" className="text-center p-2 z-1001 " >
                    {session?.user?.email || ""}
                  </HoverCardContent>
                </HoverCard>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleThemeChange}>
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Controls */}
      <div className="bottom-0 right-0 absolute">
        <div className="flex flex-col items-start gap-2 p-4">
          <Button onClick={handleSetView} className="cursor-pointer w-full">Am I Lost?</Button>
          <DirectionButton setPosition={setPosition} mapRef={mapRef}/>
        </div>
      </div>
      
    </div>
  );
}