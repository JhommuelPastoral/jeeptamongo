import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fromDirection, toDirection } = await req.json();

    if (!fromDirection || !toDirection) {
      return NextResponse.json(
        { message: "Missing input" },
        { status: 400 }
      );
    }

    const fromStop = await prisma.stop.findFirst({where: { name: { equals: fromDirection, mode: "insensitive" } },});
    const toStop = await prisma.stop.findFirst({where: { name: { equals: toDirection, mode: "insensitive" } },});

    if (!fromStop || !toStop) return NextResponse.json({ message: "Stop not found" },{ status: 404 });
    
    const fromRouteStops = await prisma.routeStop.findMany({where: { stopId: fromStop.id }});
    const toRouteStops = await prisma.routeStop.findMany({where: { stopId: toStop.id },});

    if(!toRouteStops || !fromRouteStops) return NextResponse.json({ message: "Route not found" }, { status: 404 });

    // Direct Route Found 
    if (fromRouteStops[0].routeId === toRouteStops[0].routeId ) {
      if(fromRouteStops[0].order < toRouteStops[0].order) {
        const route = await prisma.routeStop.findMany({
          where: { routeId: fromRouteStops[0].routeId },
          orderBy: { order: "asc" },
          include: {
            stop: {
              include: {
                position: {
                  omit: {
                    id: true,
                    stopId: true
                  }
                }
              }
            },
            route: true
          }
        });
        console.log('test')
        console.log(route);
        return NextResponse.json({ message: "Route found", route }, { status: 200 });
      }

    }

    console.log(fromStop, toStop);
    console.log(fromRouteStops, toRouteStops);



    return NextResponse.json({ message: "Route found"}, { status: 200 });

  } catch (error) {
    console.error("Error finding route", error);
    return NextResponse.json({ message: "Server error" },{ status: 500 });
  }
}