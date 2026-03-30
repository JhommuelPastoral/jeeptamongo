import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import isSessionAuth from "@/helpers/isSessionAuth";

export async function POST(req:Request){
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

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
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
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