import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PptxGenJS from "pptxgenjs";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const generatePPTStreamData = async(data)=>{
     let pptx = new PptxGenJS();

  // Add content slides
  data.slides.forEach((slideData) => {
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

  const buffer = await pptx.stream(); // Get the presentation as a buffer

return buffer
   


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
   - image (relevant royalty-free/public image link or null)

Output JSON strictly in this format:
{
  "references": ["url1", "url2", "url3"],
  "slides": [
    { "title": "Slide 1 Title", "text": "Short content.", "image": "https://..." },
    { "title": "Slide 2 Title", "text": "Short content.", "image": null }
  ]
}
No markdown, only JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    
    const trimmed_text = text.slice(8,-3) //trimming ```json{ .... } part
    
     const data = JSON.parse(trimmed_text);

    const generated_buffer = generatePPTStreamData(data)
     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename="ServerPresentation.pptx"');
    res.send(generated_buffer);
    

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
