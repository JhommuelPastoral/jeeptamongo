"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import Loading from "../loading";
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer),{ ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer),{ ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl),{ ssr: false });
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);export default function Dashboard() {
  const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition({
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
    <div className="w-screen h-screen">
      <Suspense fallback={<Loading />}>
        <MapContainer
          center={[currentPosition.lat, currentPosition.lng]}
          zoom={14}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
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
    </div>
  );
}