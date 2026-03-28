import axiosInstance from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export async function getJeepStops() {
  try {
    const response = await axiosInstance.get("/api/jeep/stops");
    return response.data.stops;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch jeep stops"
    );
  }
}

export function useGetJeepStops() {
  return useQuery({
    queryKey: ["jeep-stops"],
    queryFn: getJeepStops,
    retry: 3
  });
}