'use server';

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

interface SlideData {
  title: string;
  text: string;
  image?: string;
}

interface PPTData {
  references: string[];
  slides: SlideData[];
}

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_KEY!;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_CX!;

async function getImageUrls(title: string) {
  const query = encodeURIComponent(title);
  const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${SEARCH_ENGINE_ID}&key=${GOOGLE_API_KEY}&searchType=image&num=10`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) {
      console.error("No results found or API limit reached:", data);
      return [];
    }

    interface GoogleImageItem {
      link: string;
      [key: string]: unknown;
    }
    return data.items.map((item: GoogleImageItem) => item.link);
  } catch (err) {
    console.error("Error fetching images:", err);
    return [];
  }
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { title , userId } = (await req.json()) as { title: string , userId:string };
    console.log('user id from slides', userId)
    // 1️⃣ Generate 8–10 public image URLs using Google Search API
    const imageUrls = await getImageUrls(title);

    if (!imageUrls.length) {
      return NextResponse.json(
        { error: "Failed to fetch image URLs. Please try again." },
        { status: 500 }
      );
    }

    // 2️⃣ Change the prompt to *use those URLs directly*
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are helping generate structured content for a PowerPoint presentation using pptxgenjs.

Input Topic: "${title}"

Use ONLY the following image URLs for slides:
${imageUrls.map((u: string) => `- ${u}`).join("\n")}

Task:
1. Provide 3–6 reference websites related to the topic.
2. Create a presentation plan of 5–8 slides.
   Each slide must have:
   - title (short, 3–6 words)
   - text (1–3 sentences, concise)
   - image (choose only from the provided URLs above)

Output JSON strictly in this format:
{
  "references": ["url1", "url2", "url3"],
  "slides": [
    { "title": "Slide 1 Title", "text": "Short content.", "image": "https://..." },
    { "title": "Slide 2 Title", "text": "Short content.", "image": "https://..." }
  ]
}
No markdown, only JSON.
`;

    // 3️⃣ Generate structured content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }

    const data: PPTData = JSON.parse(text);

    // 4️⃣ Store conversation in Prisma
    const conversation = await prismaClient.conversation.create({
      data: {
        title,
        userId,
        references: data.references,
        slides: {
          create: data.slides.map((slide) => ({
            ...slide,
            image: slide.image ?? "",
          })),
        },
        msgs: {
          create: [
            {
              sender: "user",
              content: title,
            },
            {
              sender: "bot",
              content: `Fetched results about ${title} and generated structured PPT data.`,
              references: data.references,
            },
          ],
        },
      },
    });

    // Fetch created slides
    const slides = await prismaClient.slide.findMany({
      where: { conversationId: conversation.id },
    });
    data.slides = slides;

    return NextResponse.json({ data, conversation_id: conversation.id });
  } catch (err: unknown) {
    console.error("Error generating PPT:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
