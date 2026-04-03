import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import isSessionAuth from "@/helpers/isSessionAuth";


export async function POST(req:Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
    const {name, color} = await req.json();
    const jeep = await prisma.jeepRoute.create({
      data: {
        name,
        color
      }
    });
    return NextResponse.json({message:"Jeep created successfully"}, {status:200});
  } catch (error) {
    console.log("Error creating jeep", error);
    return NextResponse.json({message:"Error creating jeep"}, {status:500});
  }
}

export async function GET(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if (!isAuthenticated) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const jeeps = await prisma.jeepRoute.findMany({
      include: {
        stops: {
          where: {
            stop: {
              name: {
                not: {startsWith: "Connector"}, 
              },
            },
          },
          select: {
            stop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Jeeps fetched successfully", jeeps },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching jeeps", error);
    return NextResponse.json({ message: "Error fetching jeeps" }, { status: 500 });
  }
}

export async function PATCH(req:Request) {
  try {
    const {id, color} = await req.json();
    const jeep = await prisma.jeepRoute.update({
      where: {
        id
      },
      data: {
        color
      }
    });
    return NextResponse.json({message:"Jeep updated successfully"}, {status:200});
  } catch (error) {
    console.log("Error updating jeep", error);
    return NextResponse.json({message:"Error updating jeep"}, {status:500});
  }
}