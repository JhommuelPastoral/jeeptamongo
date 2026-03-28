import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
export async function POST(req: Request) {
  try {
    const { fromDirection, toDirection } = await req.json();

    if (!fromDirection || !toDirection) {
      return NextResponse.json(
        { message: "Missing input" },
        { status: 400 }
      );
    }

    // Check if route is cached
    const redisKey = `findRoute:${fromDirection}-${toDirection}`;
    const cachedRoute = await redis.get(redisKey);
    if(cachedRoute) return NextResponse.json(cachedRoute, { status: 200 });
    
    const fromStop = await prisma.stop.findFirst({where: { name: { equals: fromDirection, mode: "insensitive" } },});
    const toStop = await prisma.stop.findFirst({where: { name: { equals: toDirection, mode: "insensitive" } },});

    if (!fromStop || !toStop) return NextResponse.json({ message: "Stop not found" },{ status: 404 });
    
    const fromRouteStops = await prisma.routeStop.findMany({where: { stopId: fromStop.id }});
    const toRouteStops = await prisma.routeStop.findMany({where: { stopId: toStop.id },});

    if(!toRouteStops || !fromRouteStops) return NextResponse.json({ message: "Route not found" }, { status: 404 });

    // Direct Route Found 
    if (fromRouteStops[0].routeId === toRouteStops[0].routeId ) {
      const isReversed = fromRouteStops[0].order > toRouteStops[0].order;
      const route = await prisma.routeStop.findMany({
        where: { routeId: fromRouteStops[0].routeId },
        orderBy: { order: isReversed ? "desc" : "asc" },
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

      const reversedArray = [];
      if(isReversed){
        for(const routeStop of route){
          const temp = {
            ...routeStop,
            stop: {
              ...routeStop.stop,
              position: [...routeStop.stop.position].reverse()
            }
          }
          reversedArray.push(temp);
        }
      };

      const finalRoute = isReversed ? reversedArray : route;
      await redis.set(redisKey, finalRoute);
      return NextResponse.json({ message: "Route found", route: finalRoute }, { status: 200 });
    }

    // Transfer Route Logic Hell NAHHHHHH



    return NextResponse.json({ message: "Route found"}, { status: 200 });
  } catch (error) {
    console.error("Error finding route", error);
    return NextResponse.json({ message: "Server error" },{ status: 500 });
  }
}