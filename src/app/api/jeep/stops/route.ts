import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
      const {jeepId, name, start, end}: {jeepId: string, name: string, start: string, end: string} = await request.json();
      const stop = await prisma.stop.create({
        data: {
          jeepId: jeepId,
          name,
          start,
          end
        }
      });
      return NextResponse.json({message: "success", data: stop}, {status: 200})
  } catch (error) {
    console.log("Post Stop Error", error);
    return NextResponse.json({message: "Could not create stop", error}, {status: 500})
  }
  
}

export async function GET(request: Request) {
  try {
    const stops = await prisma.stop.findMany({
      include:{
        jeep: true,
        position: true
      }
    });
    return NextResponse.json({message: "success", data: stops}, {status: 200})
  } catch (error) {
    console.log("Get Stop Error", error);
    return NextResponse.json({message: "Could not get stops", error}, {status: 500})
  }
}