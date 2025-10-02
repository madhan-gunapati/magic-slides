'use server';

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


// Type definitions for slides
interface SlideData {
  title: string;
  text: string;
  image?: string;
}

interface PPTData {
  references: string[];
  slides: SlideData[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);


  

export async function POST(req: Request) {
  try {
    const { title } = (await req.json()) as { title: string };

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are helping generate structured content for a PowerPoint presentation using pptxgenjs.

Input: ${title}

Task:
1. Search or infer and provide 3–6 reference websites related to the title.
2. Create a presentation plan of 5–8 slides.
   Each slide must have:
   - title (short, 3–6 words)
   - text (1–3 sentences, concise)
   - image (direct, working image link in JPG/PNG/WebP format from a reliable source such as  Pexels,  or other open-license image hosts. Avoid homepage URLs, PDFs, or non-image links.)

Output JSON strictly in this format:
{
  "references": ["url1", "url2", "url3"],
  "slides": [
    { "title": "Slide 1 Title", "text": "Short content.", "image": "https://working-image-link.jpg"},
    { "title": "Slide 2 Title", "text": "Short content.", "image": "https://working-image-link.jpg" }
  ]
}
No markdown, only JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let text = await response.text();

    // Clean up JSON (sometimes Gemini outputs ```json ... ```)
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }

    const data: PPTData = JSON.parse(text);

    

    return new NextResponse(JSON.stringify({data}));
  } catch (err: unknown) {
    console.error("Error generating PPT:", err);
    if(err instanceof Error){
    return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
