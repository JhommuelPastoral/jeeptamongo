import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req:Request) {
  try {
    const {name} = await req.json();

    const jeep = await prisma.jeepRoute.create({
      data: {
        name
      }
    });
    return NextResponse.json({message:"Jeep created successfully"}, {status:200});
  } catch (error) {
    console.log("Error creating jeep", error);
    return NextResponse.json({message:"Error creating jeep"}, {status:500});
  }
}

export async function GET(req:Request){
  try {
    const jeeps = await prisma.jeepRoute.findMany();
    return NextResponse.json({message:"Jeeps fetched successfully", jeeps}, {status:200});
  } catch (error) {
    console.log("Error fetching jeeps", error);
    return NextResponse.json({message:"Error fetching jeeps"}, {status:500});
  }
}