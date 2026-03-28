import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req:Request){
  try {
    const {positions, stopId} = await req.json();
    for(const pos of positions){
      await prisma.position.create({
        data:{
          lng: pos[0],
          lat: pos[1],
          stopId
        }
      })
    }
    return NextResponse.json({message:"Positions created successfully"}, {status:200});
  } catch (error) {
    console.log("Error creating positions", error);
    return NextResponse.json({message:"Error creating positions"}, {status:500});
  }
}

export async function GET(req:Request) {
  try {
    const position  = await prisma.position.findMany({
      omit:{
        id: true,
        stopId: true
      }
    });
    return NextResponse.json({message:"Positions fetched successfully", position}, {status:200});
  } catch (error) {
    console.log("Error fetching positions", error);
    return NextResponse.json({message:"Error fetching positions"}, {status:500});
  }
}