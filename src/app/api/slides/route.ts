import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PptxGenJS from "pptxgenjs";
import { slides } from "googleapis/build/src/apis/slides";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function generatePPTStreamData(data: any) {
  let pptx = new PptxGenJS();
    console.log(data.slides)
  // Add content slides
  data.slides.forEach((slideData: any) => {
    let slide = pptx.addSlide();

    // Slide Title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.5,
      fontSize: 24,
      bold: true,
    });

    // Slide Text
    slide.addText(slideData.text, {
      x: 0.5,
      y: 1.2,
      fontSize: 14,
      color: "363636",
      w: 8,
    });

    // Slide Image (if available)
    if (slideData.image) {
      slide.addImage({
        path: slideData.image,
        x: 0.5,
        y: 2,
        w: 7,
        h: 3.5,
      });
    }
  });

  // Return ArrayBuffer for download
  const buffer = await pptx.write("arraybuffer");
  return buffer;
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

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
   - image (relevant  image link  from websites)

Output JSON strictly in this format:
{
  "references": ["url1", "url2", "url3"],
  "slides": [
    { "title": "Slide 1 Title", "text": "Short content.", "image": "https://..." },
    { "title": "Slide 2 Title", "text": "Short content.", "https://..." }
  ]
}
No markdown, only JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up JSON (sometimes Gemini outputs ```json ... ```)
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json|```/g, "").trim();
    }

    const data = JSON.parse(cleaned);

    // Generate PPT buffer
    const buffer = await generatePPTStreamData(data);

    // Return as downloadable PPT
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="ServerPresentation.pptx"',
      },
    });
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}