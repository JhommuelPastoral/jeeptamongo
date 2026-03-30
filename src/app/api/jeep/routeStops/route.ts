import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import isSessionAuth from "@/helpers/isSessionAuth";


export async function POST(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
    const {routeStop} = await req.json();
    if(!routeStop) return NextResponse.json({message:"No data provided"}, {status:400});
    const routeStops = await prisma.routeStop.createMany({data:routeStop});
    return NextResponse.json({message:"Stop created successfully"}, {status:200});
  } catch (error) {
    console.log("Error creating stop", error);
    return NextResponse.json({message:"Error creating stop"}, {status:500});
  }
}

export async function GET(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

    const routeStops = await prisma.routeStop.findMany({
      include:{
        stop:{
          include: {
            position: {
              omit:{
                id: true,
                stopId: true
              }
            }
          },
          omit:{
            id: true
          }
        },
        route: true
      }
    });
    return NextResponse.json({message:"Stops fetched successfully", routeStops}, {status:200});
  } catch (error) {
    console.log("Error fetching stops", error);
    return NextResponse.json({message:"Error fetching stops"}, {status:500});
  }
}