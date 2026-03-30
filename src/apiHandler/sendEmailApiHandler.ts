import axiosInstance from "@/lib/axiosInstance";
import { useMutation } from "@tanstack/react-query";

type SendPayload = {
  email: string;
  subject: string;
  message: string;
};

export async function sendEmail({ email, subject, message }: SendPayload) {
  try {
    const response = await axiosInstance.post("/api/send-email", { email, subject, message });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
}

export function useSendEmail() {
  return useMutation({
    mutationFn: sendEmail
  })
}
