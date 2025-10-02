import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest){

   
const {edit_statement , slides} = await req.json()
// console.log(body)

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an assistant helping to edit structured slide content for a PowerPoint presentation using pptxgenjs.

The user has provided:
- An edit instruction: "${edit_statement}"
- Existing slides JSON: ${JSON.stringify(slides)}

Task:
1. Modify the existing slides according to the edit instruction.
2. You may add, remove, or update slide titles, text, or images, but keep the structure consistent.
3. Each slide must have:
   - "title": short, 3–6 words
   - "text": 1–3 concise sentences
   - "image": a direct working JPG/PNG/WebP image link from reliable sources . Avoid homepage URLs, PDFs, or non-image links.


Output strictly valid JSON in this format:
{
  
  "slides": [
    { "title": "Slide 1 Title", "text": "Short content.", "image": "https://working-image-link.jpg" },
    { "title": "Slide 2 Title", "text": "Short content.", "image": "https://working-image-link.jpg" }
  ]
}

No markdown, no extra text — output only JSON.

`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let text = await response.text();

    // Clean up JSON (sometimes Gemini outputs ```json ... ```)
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }

    const data = JSON.parse(text);
    

return NextResponse.json({msg:'changed the data' , data })
}

