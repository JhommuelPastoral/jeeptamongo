"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import Loading from "../loading";
import harversineFormula from "@/helpers/harversineFormula";
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer),{ ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer),{ ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker),{ ssr: false });


export default function Dashboard() {
  const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
  const [prevTime, setPrevTime] = useState(0);
  const [prevPosition, setPrevPosition] = useState({lat : 0, lng: 0});
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Get current position
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        if(prevTime !== 0 && prevPosition.lat !== 0 && prevPosition.lng !== 0){ 
          const distance = harversineFormula(prevPosition.lat, prevPosition.lng, newLat, newLng)
          const timeDiff = (position.timestamp - prevTime) / 1000 // seconds;
          const speedMps = distance / timeDiff; // meters/sec
          const speedKmh = speedMps * 3.6;
          setCurrentSpeed(speedKmh);
        }

        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setPrevTime(position.timestamp);
        setPrevPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    // cleanup (VERY IMPORTANT)
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (currentPosition.lat === 0 && currentPosition.lng === 0) {
    return <Loading />;
  }
  return (
    <div className="w-full h-screen relative">
      <Suspense fallback={<Loading />}>
        <MapContainer
          center={[currentPosition.lat, currentPosition.lng]}
          zoom={14}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
          maxBounds={[[6.8, 125.1],[7.3, 125.8] ]}
          maxBoundsViscosity={1}
          minZoom={12}
          maxZoom={18}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <CircleMarker
            center={[currentPosition.lat, currentPosition.lng]}
            radius={5}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 1,
            }}
            className="animate-pulse"
          />        
        </MapContainer>   
      </Suspense>

      {/* Top Right Corner Details */}
      <div className="absolute top-0 left-0 z-1000">
        <div className="flex flex-col items-start gap-2 p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <p className="text-white text-sm">Current Position: lat:{currentPosition.lat.toFixed(2)}, lng:{currentPosition.lng.toFixed(2) }</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <p className="text-white text-sm">Current Speed: {currentSpeed.toFixed(2)} Kmh </p>
          </div>
        </div>
      </div>
    </div>
  );
}