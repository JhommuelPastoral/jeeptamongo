import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import isSessionAuth from "@/helpers/isSessionAuth";

export async function POST(req:Request){
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

    const {positions, stopId, direction} = await req.json();
    for(const pos of positions){
      await prisma.position.create({
        data:{
          lng: pos[0],
          lat: pos[1],
          stopId,
          direction
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
    const position  = await prisma.position.findMany({});
    return NextResponse.json({message:"Positions fetched successfully", position}, {status:200});
  } catch (error) {
    console.log("Error fetching positions", error);
    return NextResponse.json({message:"Error fetching positions"}, {status:500});
  }
}

export async function PATCH(req:Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
    
    // Get all stops from prisma
    const stops = await prisma.stop.findMany({});

    for(const stop of stops){
      await prisma.position.updateMany({
        where: {
          stopId: stop.id as string
        },
        data:{
          direction: "Forward"
        }
      })
    }
    return NextResponse.json({message:"Stops patched successfully"}, {status:200});
    
    
  } catch (error) {
    console.log("Error patching stops", error);
    return NextResponse.json({message:"Error patching stops"}, {status:500});
  }
}

// export async function DELETE(req:Request) {
//   try {
//     const isAuthenticated = await isSessionAuth();
//     if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
//     const {id} = await req.json();
//     await prisma.position.delete({
//       where: {
//         id
//       }
//     });
//     return NextResponse.json({message:"Position deleted successfully"}, {status:200});
//   } catch (error) {
//     console.log("Error deleting position", error);
//     return NextResponse.json({message:"Error deleting position"}, {status:500});
//   }
// }