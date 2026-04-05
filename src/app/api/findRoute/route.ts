import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import isSessionAuth from "@/helpers/isSessionAuth";


// ========================================================= //
// Types for the find Route API, WIll transfer after some refactoring
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

type FilterRouteStopsParams = {
  allRouteStops: RouteStop[];
  minOrder: number;
  maxOrder: number;
  canReverseFrom: boolean;
  canReverseTo: boolean;
  isReversed: boolean;
}


// TODO :
// FIX GET FIND STOP SINCE THERE IS A LOT OF STOPSNAME CONNECTED TO JEEP





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
        selectedPositions = [...reversePositions];
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


function filterDirectRouteStops({ allRouteStops, minOrder, maxOrder, canReverseFrom, canReverseTo, isReversed }: FilterRouteStopsParams): RouteStop[] {
  
  // 
  if(!canReverseFrom && isReversed && !canReverseTo) {
    const allCantReverseRouteMinOrder = allRouteStops.filter(routeStop => !routeStop.canReverse && routeStop.order <= minOrder).sort((a, b) => a.order - b.order);
    const allCantReverseRouteMaxOrder = allRouteStops.filter(routeStop => !routeStop.canReverse && routeStop.order > maxOrder).sort((a, b) => a.order - b.order);
    return [...allCantReverseRouteMaxOrder, ...allCantReverseRouteMinOrder];
  };
  if(!canReverseFrom && isReversed){
    const allCanReverseRoute = allRouteStops.filter(routeStop => routeStop.canReverse && routeStop.order > minOrder).sort((a, b) => b.order - a.order);
    const allCantReverseRoute = allRouteStops.filter(routeStop => !routeStop.canReverse && routeStop.order > maxOrder).sort((a, b) => a.order - b.order);
    return [...allCantReverseRoute, ...allCanReverseRoute];
  }
  else{
    const route = allRouteStops.filter(routeStop => routeStop.order > minOrder && routeStop.order <= maxOrder).sort((a, b) => a.order - b.order);
    return route;
  }
}


export async function POST(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

    const { fromDirection, toDirection } = await req.json();

    // Validate Input
    if (!fromDirection || !toDirection) return NextResponse.json({ message: "Missing input" },{ status: 400 });

    // Check if route is in the cached
    const redisKey = `findRoute:${fromDirection}-${toDirection}`;
    const cachedRoute = await redis.get(redisKey);
    if(cachedRoute) return NextResponse.json({message:"Route found", route: cachedRoute}, { status: 200 });
    

    // Database Hit 
    // Check if stop is in the database
    const [fromStop, toStop] = await Promise.all([
      prisma.stop.findMany({where: { name: { equals: fromDirection, mode: "insensitive" } },}),
      prisma.stop.findMany({where: { name: { equals: toDirection, mode: "insensitive" } },})
    ]);

    // Validate Stop 
    if (fromStop.length === 0 || toStop.length === 0) return NextResponse.json({ message: "Stop not found" },{ status: 404 });

    const[fromRouteStops, toRouteStops] = await Promise.all([
      prisma.routeStop.findMany({where: { stopId: { in: fromStop.map(s => s.id)}}}),
      prisma.routeStop.findMany({where: { stopId: { in: toStop.map(s => s.id)}}})
    ]);

    // Validate Route 
    if (fromRouteStops.length === 0 || toRouteStops.length === 0) return NextResponse.json({ message: "Route not found " }, { status: 404 });

    // Check if it is a direct route
    // const isDirectRoute = fromRouteStops.some(from => toRouteStops.some(to => from.routeId === to.routeId));

    // use Map instead of nested loop to find the direct route, because it is more efficient, time complexity is O(n) instead of O(n^2)
    const toRouteMap = new Map<string, RouteStopPrisma>(toRouteStops.map(routeStop => [routeStop.routeId, routeStop]));
    const allMatchRoutes:[RouteStopPrisma, RouteStopPrisma][] = [];

    // Loop through fromRouteStops and find the all match in toRouteMap, if found save push to allMatchRoutes, if not continue until the end of the loop
    for (const from of fromRouteStops) {
      const match = toRouteMap.get(from.routeId);
      if (match) allMatchRoutes.push([from, match]);
    };
    const allRoutesStopRaw = await prisma.routeStop.findMany({
      orderBy:{order: "asc"},
      include:{stop: {include: {position: {omit: {id: true,stopId: true},orderBy:{order: "asc",}}}},route: true}      
    });

    // MapT The AllRoutesStop For Fast lookup when filtering the direct route, since we will filter the direct route one by one, it is better to have a map of all routes stop for fast lookup instead of hitting the database multiple times
    const allRoutesStopMap = new Map<string, RouteStop[]>();
    for (const routeStop of allRoutesStopRaw) {
      if (!allRoutesStopMap.has(routeStop.routeId)) {
        allRoutesStopMap.set(routeStop.routeId, []);
      }
      allRoutesStopMap.get(routeStop.routeId)!.push(routeStop);
    };
    // Direct Route Found 
    if (allMatchRoutes.length > 0) {
      const allDirectRoutes: RouteSimplified[] = [];
      for(const [fromMatch, toMatch] of allMatchRoutes){
        const from = fromMatch.order;
        const to = toMatch.order;
        const minOrder = Math.min(from, to);
        const maxOrder = Math.max(from, to);
        const canReverseFrom = fromMatch?.canReverse;
        const canReverseTo = toMatch?.canReverse;
        const isReversed = from > to;

        const allRouteStops = allRoutesStopMap.get(fromMatch.routeId)!;
        const filtered = filterDirectRouteStops({allRouteStops, minOrder, maxOrder, canReverseFrom, canReverseTo, isReversed});
        const finalRoute = getNormalizedRoutes(filtered, isReversed);
        const simplifiedFinalRoute = getRouteSimplified(finalRoute);
        if(simplifiedFinalRoute.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });
        allDirectRoutes.push(...simplifiedFinalRoute);
      };
      if(allDirectRoutes.length === 0) return NextResponse.json({ message: "Route not found" }, { status: 404 });
      // await redis.set(redisKey, finalRoute);
      return NextResponse.json({ message: "Route found", route: allDirectRoutes }, { status: 200 });
    };

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