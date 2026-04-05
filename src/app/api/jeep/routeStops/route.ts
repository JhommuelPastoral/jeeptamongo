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
    return NextResponse.json({message:"Route stop created successfully"}, {status:200});
  } catch (error) {
    console.log("Error creating stop", error);
    return NextResponse.json({message:"Error creating stop"}, {status:500});
  }
}

export async function GET(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});
    // const routeStops = await prisma.routeStop.findMany({
    //   include:{
    //     stop:{
    //       include: {
    //         position: {
    //           omit:{
    //             id: true,
    //             stopId: true
    //           }
    //         }
    //       },
    //       omit:{
    //         id: true
    //       }
    //     },
    //     route: true
    //   },
    //   orderBy: {
    //     order: "asc"
    //   }
    // });
    const routeStops = await prisma.routeStop.findMany({
      include:{
        stop:{
          include: {
            position: true
          }
        },
        route:true
      }
    
    });
    return NextResponse.json({message:"Route stops fetched successfully", routeStops}, {status:200});
  } catch (error) {
    console.log("Error fetching stops", error);
    return NextResponse.json({message:"Error fetching stops"}, {status:500});
  }
}


// export async function PATCH(req:Request) {
//   try {
//     const isAuthenticated = await isSessionAuth();
//     if(!isAuthenticated) return NextResponse.json({message:"Not authenticated"}, {status:401});

//     const routeStops = await prisma.routeStop.updateMany({
//       where: {
//         order: {
//           gte: 46
//         },
//         routeId:"69d0e6b0f5d4a9b11148d5d8"
//       },
//       data: {
//         canReverse: false
//       }
//     });

//     return NextResponse.json({message:"Route stops patched successfully"}, {status:200});

//   } catch (error) {
//     console.log("Error patching stops", error);
//     return NextResponse.json({message:"Error patching stops"}, {status:500});    
//   }
// }



// export async function DELETE(req:Request) {
//   try {
//     const deletedRouteStops = await prisma.routeStop.deleteMany({
//       where:{
//         order: 94
//       }
//     });
//     return NextResponse.json({message:"Stops deleted successfully", deletedRouteStops}, {status:200});
//   } catch (error) {
//     console.log("Error deleting stops", error);
//     return NextResponse.json({message:"Error deleting stops"}, {status:500});
//   }
// }