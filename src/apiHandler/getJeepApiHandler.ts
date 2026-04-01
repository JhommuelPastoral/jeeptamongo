import axiosInstance from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export async function getJeeps() {
  try {
    const response = await axiosInstance.get("/api/jeep");
    return response.data.jeeps;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch jeeps");
  }
}

export function useGetJeeps() {
  return useQuery({
    queryKey: ["jeeps"],
    queryFn: getJeeps
  });
}