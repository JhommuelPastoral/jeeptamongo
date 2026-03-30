import { auth } from "@/lib/auth";

export default async function isSessionAuth() : Promise<boolean> {
  if(process.env.NODE_ENV === "development") return true;
  const session = await auth();
  return !!session;
}