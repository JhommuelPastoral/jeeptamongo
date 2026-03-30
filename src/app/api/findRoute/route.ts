import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import isSessionAuth from "@/helpers/isSessionAuth";
export async function POST(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

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
    if(cachedRoute) return NextResponse.json({message:"Route found", route: cachedRoute}, { status: 200 });
    

    // Database Hit
    const fromStop = await prisma.stop.findFirst({where: { name: { equals: fromDirection, mode: "insensitive" } },});
    const toStop = await prisma.stop.findFirst({where: { name: { equals: toDirection, mode: "insensitive" } },});

    if (!fromStop || !toStop) return NextResponse.json({ message: "Stop not found" },{ status: 404 });
    
    const fromRouteStops = await prisma.routeStop.findMany({where: { stopId: fromStop.id }});
    const toRouteStops = await prisma.routeStop.findMany({where: { stopId: toStop.id },});

    if(toRouteStops.length === 0 || fromRouteStops.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });

    // Direct Route Found 
    if(fromRouteStops.length ===0 || toRouteStops.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });
    if (fromRouteStops[0].routeId === toRouteStops[0].routeId ) {
      
      const from = fromRouteStops[0].order;
      const to = toRouteStops[0].order;
      const minOrder = Math.min(from, to);
      const maxOrder = Math.max(from, to);

      const isReversed = from > to;

      const route = await prisma.routeStop.findMany({
        where: {
          routeId: fromRouteStops[0].routeId,
          order: {
            gte: isReversed ? minOrder +  1 : minOrder,
            lte: maxOrder
          }
        },
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
      })
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
    // Transfer Jeep Logic Hell NAHH HOW TO DO THIS DAWG
    return NextResponse.json({ message: "Route found"}, { status: 200 });
  } catch (error) {
    console.error("Error finding route", error);
    return NextResponse.json({ message: "Server error" },{ status: 500 });
  }
}

export async function DELETE(req:Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
    const key = await redis.keys("findRoute:*");
    await redis.del(...key);
    return NextResponse.json({ message: "Cache cleared"}, { status: 200 });
  } catch (error) {
    console.error("Error clearing cache", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}