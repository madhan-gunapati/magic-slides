import { PrismaClient } from "@prisma/client";
import {  NextResponse } from "next/server";

const prismaClient = new PrismaClient();


export async function POST(req:Request) {
    const {userId} = await req.json()
    
    if(userId){
    const conv_list = await prismaClient.conversation.findMany({where:{userId:userId}})
        
    return NextResponse.json({msg:conv_list})
    }
    return NextResponse.json({msg:[]})

}

