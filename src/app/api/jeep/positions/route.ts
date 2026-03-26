import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request:Request) {
  try {
    const {positions, stopId} = await request.json()
    console.log(positions);

    for(const position of positions) {
      await prisma.position.create({
        data: {
          stopId,
          lat: position[0],
          lng: position[1]
        }
      });
    }
    
    return NextResponse.json({message: "success"}, {status: 200})
  } catch (error) {
    
  }
}