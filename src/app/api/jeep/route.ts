import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {name} = await request.json()
    const jeep = await prisma.jeep.create({
      data: {
        name: name
      }
    });
    return NextResponse.json({message: "success"}, {status: 200})
  } catch (error) {
    console.log("Post Jeep Error", error);
    return NextResponse.json({message: "error", error}, {status: 500})
  }
}

export async function GET(request:Request) {
  try {
    const jeeps = await prisma.jeep.findMany({
      include: {
        stops: {
          include: {
            position: true
          }
        },
      }
    }
    );
    console.log();
    return NextResponse.json({message: "success", jeeps}, {status: 200})
  } catch (error) {
    console.log("Get Jeep Error", error);
    return NextResponse.json({message: "error", error}, {status: 500})
  }
}