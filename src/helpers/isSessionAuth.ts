import { auth } from "@/lib/auth";

export default async function isSessionAuth() : Promise<boolean> {
  const session = await auth();
  return !!session;
}