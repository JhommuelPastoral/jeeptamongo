import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(request: Request) {
  try {
    const {email, fullName} = await request.json();
    const user = await prisma.user.upsert({
      where: {
        email: email
      },
      update: {
        fullName: fullName
      },
      create: {
        email: email,
        fullName: fullName
      }
    });
    return NextResponse.json({Message: "Sign in successful"}, {status: 200});
  } catch (error) {
    console.log("Sign in error", error);
    return NextResponse.json({Message: "Sign in error"}, {status: 500});
  }
}