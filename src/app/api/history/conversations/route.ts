import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prismaClient = new PrismaClient();


export async function GET() {
    
    
    const conv_list = await prismaClient.conversation.findMany()

    return NextResponse.json({msg:conv_list})

}

