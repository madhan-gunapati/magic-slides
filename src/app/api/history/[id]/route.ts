import { PrismaClient } from "@prisma/client";
import {  NextResponse } from "next/server";

const prismaClient = new PrismaClient();


export async function POST(req: Request) {
  const url = new URL(req.url!);
  const id = url.pathname.split("/").pop();

  const conv_item = await prismaClient.conversation.findUnique({
    where: { id },
    include: {
      slides: true,
      msgs: true,
    },
  });

  if (!conv_item) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json(conv_item);
}
