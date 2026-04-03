import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import isSessionAuth from "@/helpers/isSessionAuth";

type Position = { lat: number; lng: number; direction: string };
type RouteStop = {
  id: string;
  routeId: string;
  stopId: string;
  order: number;
  canReverse: boolean;
  stop: {
    id: string;
    name: string;
    position: Position[];
  }
  route: {
    id: string;
    name: string;
    color: string;
  }
};

type RouteSimplified = {
  jeepName: string;
  color: string;
  stop: {
    name: string;
    position: Position[];
  };
}

type RouteStopPrisma ={
  id: string;
  routeId: string;
  stopId: string;
  order: number;
  canReverse: boolean;
}
// Helper Function: normalizes positions depending on direction
function getNormalizedRoutes(routeStop: RouteStop[], isReversed: boolean): RouteStop[] {
  const routes = routeStop.map((routeStop: RouteStop) => {
    const positions = routeStop.stop.position;
    const canReverse = routeStop.canReverse;
    let selectedPositions;
    if (isReversed && canReverse) {
      // When reversed, try to use "Reverse" positions first
      const reversePositions = positions.filter(p => p.direction === "Reverse");

      if (reversePositions.length > 0) {
        selectedPositions = [...reversePositions].reverse();
      } else {
        // fallback to forward but reversed order
        const forwardPositions = positions.filter(p => p.direction === "Forward");
        selectedPositions = [...forwardPositions].reverse();
      }
    } else {
      selectedPositions = positions.filter(p => p.direction === "Forward");
    }

    return {
      ...routeStop,
      stop: {
        ...routeStop.stop,
        position: selectedPositions
      }
    };
  });

  return routes;
}

function getRouteSimplified(routeStops: RouteStop[]): RouteSimplified[]{
  const simplified = routeStops.map((routeStop) => {
    return {
      jeepName: routeStop.route.name,
      color: routeStop.route.color,
      stop: {
        name: routeStop.stop.name,
        position: routeStop.stop.position
      }
    }
  });
  return simplified;
}

export async function POST(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

    const { fromDirection, toDirection } = await req.json();

    // Validate Input
    if (!fromDirection || !toDirection) {
      return NextResponse.json(
        { message: "Missing input" },
        { status: 400 }
      );
    }

    // Check if route is in the cached
    const redisKey = `findRoute:${fromDirection}-${toDirection}`;
    const cachedRoute = await redis.get(redisKey);
    if(cachedRoute) return NextResponse.json({message:"Route found", route: cachedRoute}, { status: 200 });
    

    // Database Hit 
    // Check if stop is in the database

    const [fromStop, toStop] = await Promise.all([
      prisma.stop.findFirst({where: { name: { equals: fromDirection, mode: "insensitive" } },}),
      prisma.stop.findFirst({where: { name: { equals: toDirection, mode: "insensitive" } },})
    ]);
    // const fromStop = await prisma.stop.findFirst({where: { name: { equals: fromDirection, mode: "insensitive" } },});
    // const toStop = await prisma.stop.findFirst({where: { name: { equals: toDirection, mode: "insensitive" } },});

    // Validate Stop 
    if (!fromStop || !toStop) return NextResponse.json({ message: "Stop not found" },{ status: 404 });
    
    const [fromRouteStops, toRouteStops] = await Promise.all([
      prisma.routeStop.findMany({where: { stopId: fromStop.id },}),
      prisma.routeStop.findMany({where: { stopId: toStop.id },})
    ]);

    // const fromRouteStops = await prisma.routeStop.findMany({where: { stopId: fromStop.id }});
    // const toRouteStops = await prisma.routeStop.findMany({where: { stopId: toStop.id },});

    // Validate Route 
    if (fromRouteStops.length === 0 || toRouteStops.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });

    // Check if it is a direct route
    // const isDirectRoute = fromRouteStops.some(from => toRouteStops.some(to => from.routeId === to.routeId));

    // use Map instead of nested loop to find the direct route, because it is more efficient, time complexity is O(n) instead of O(n^2)
    const toRouteMap = new Map<string, RouteStopPrisma>(toRouteStops.map(routeStop => [routeStop.routeId, routeStop]));
    let fromMatch : RouteStopPrisma | null = null;
    let toMatch : RouteStopPrisma | null = null;
    // Loop through fromRouteStops and find the first match in toRouteMap, if found break the loop, if not continue until the end of the loop
    for (const from of fromRouteStops) {
      const match = toRouteMap.get(from.routeId);
      if (match) {
        fromMatch = from;
        toMatch = match;
        break;
      }
    }
    // Direct Route Found 
    if (fromMatch && toMatch) {
      const from = fromMatch.order;
      const to = toMatch.order;
      const minOrder = Math.min(from, to);
      const maxOrder = Math.max(from, to);
      const canReverseFrom = fromMatch?.canReverse;
      const isReversed = from > to;

      // This Case is when, we are going back to the start of the route, when the route is cannot be reversed or no bidirectional route
      // First is to get all the routes that can be reversed, must be greater than minOrder, sorted by order desc
      // Second is to get all the routes that cannot be reversed, must be greater than or equal to maxOrder, sorted by order asc
      // Combined them and get the final route

      if(!canReverseFrom && isReversed) {
        const allCanReverseRoute = await prisma.routeStop.findMany({
          where:{
            routeId: fromMatch.routeId,
            canReverse: true,
            order:{
              gt: minOrder
            }
          },
          orderBy: {
            order: "desc"
          },
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
        
        const allCantReverseRoute = await prisma.routeStop.findMany({
          where:{
            routeId: fromMatch.routeId,
            canReverse: false,
            order:{
              gt: maxOrder
            }
          },
          orderBy: {
            order: "asc"
          },
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

        const allRoutes = [...allCantReverseRoute, ...allCanReverseRoute];
        const finalRoute = getNormalizedRoutes(allRoutes, isReversed);
        const simplifiedRoute = getRouteSimplified(finalRoute);
        if(finalRoute.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });
        // await redis.set(redisKey, finalRoute);
        return NextResponse.json({ message: "Route found", route: simplifiedRoute }, { status: 200 });
      }
      
      // This Case is when the route has bidirectional route and can be reversed
      else{
        const route = await prisma.routeStop.findMany({
          where: {
            routeId: fromMatch.routeId,
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
        });
        const finalRoute = getNormalizedRoutes(route, isReversed);
        const simplifiedRoute = getRouteSimplified(finalRoute);
        if(finalRoute.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });
        // await redis.set(redisKey, finalRoute);
        return NextResponse.json({ message: "Route found", route: simplifiedRoute }, { status: 200 });
      }

    }
    // Transfer Jeep Logic Hell NAHH HOW TO DO THIS DAWG
    // return NextResponse.json({ message: "Route found"}, { status: 200 });
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