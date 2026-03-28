import axiosInstance from "@/lib/axiosInstance";
import { useMutation } from "@tanstack/react-query";


type FindRoutePayload = {
  fromDirection: string;
  toDirection: string;
};
export async function findRoute({ fromDirection, toDirection }: FindRoutePayload) {
  try {
    const response = await axiosInstance.post("/api/findRoute", {
      fromDirection,
      toDirection,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to find route");
  }
}

export function useFindRoute() {
  return useMutation({
    mutationFn: findRoute
  });
}