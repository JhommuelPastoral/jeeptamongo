import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const {stops} = await req.json();
    if(!stops) return NextResponse.json({message:"No data provided"}, {status:400});
    const stop = await prisma.stop.createMany({data:stops});
    return NextResponse.json({message:"Stop created successfully"}, {status:200});
  } catch (error) {
    console.log("Error creating stop", error);
    return NextResponse.json({message:"Error creating stop"}, {status:500});
  }
}
// const session = await auth();
// if(!session) return NextResponse.json({message:"Not authenticated"}, {status:401});

export async function GET(req: Request) {
  try {
    const stops = await prisma.stop.findMany();
    return NextResponse.json({message:"Stops fetched successfully", stops}, {status:200});
  } catch (error) {
    console.log("Error fetching stops", error);
    return NextResponse.json({message:"Error fetching stops"}, {status:500});
  }
}