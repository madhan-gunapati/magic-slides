import { NextResponse } from "next/server"
export async function GET(){
return  NextResponse.json({msg:'received'})
}


// src/app/api/slides/route.ts
// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import PptxGenJS from "pptxgenjs";
// import CloudConvert from "cloudconvert";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
// const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

// async function generatePPTStreamData(data: any) {
//   let pptx = new PptxGenJS();

//   data.slides.forEach((slide: any) => {
//     const s = pptx.addSlide();
//     s.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true });
//     s.addText(slide.text, { x: 0.5, y: 1.2, fontSize: 14, color: "363636", w: 8 });
//     if (slide.image) {
//       s.addImage({ path: slide.image, x: 0.5, y: 2, w: 7, h: 3.5 });
//     }
//   });

//   return Buffer.from(await pptx.write("arraybuffer"));
// }

// export async function POST(req: Request) {
//   try {
//     const { title } = await req.json();

// // 1. Generate slide content with Gemini
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// const prompt = `
// Input: ${title}
// Generate 5-8 slides with title, text, image.
// Output JSON:
// {
//   "slides": [
//     { "title": "Slide 1", "text": "Content", "image": "https://..." }
//   ]
// }`;

// const result = await model.generateContent(prompt);
// const rawText = (await result.response).text();

// // Extract JSON only
// const match = rawText.match(/\{[\s\S]*\}/);
// if (!match) throw new Error("No JSON found in AI response");

// let data;
// try {
//   data = JSON.parse(match[0]);
// } catch (err) {
//   console.error("Failed to parse AI response JSON:", rawText);
//   throw new Error("Invalid JSON from AI");
// }

// // Continue with PPTX generation...
// const pptxBuffer = await generatePPTStreamData(data);

//     // CloudConvert job
//     const job = await cloudConvert.jobs.create({
//       tasks: {
//         "import-pptx": { operation: "import/upload" },
//         "convert-to-pdf": { operation: "convert", input: "import-pptx", input_format: "pptx", output_format: "pdf" },
//         "export-pdf": { operation: "export/url", input: "convert-to-pdf" },
//       },
//     });

//     const importTask = job.tasks.find((t: any) => t.name === "import-pptx");
//     if (!importTask) throw new Error("Import task not found");

//     // Upload PPTX
//     await cloudConvert.tasks.upload(importTask, pptxBuffer, {
//       filename: "presentation.pptx",
//       size: pptxBuffer.length,
//     });

//     // Wait for completion
//     const completedJob = await cloudConvert.jobs.wait(job.id);
//     const exportTask = completedJob.tasks.find((t: any) => t.name === "export-pdf");

//     if (!exportTask?.result?.files?.length) throw new Error("No PDF files returned from CloudConvert");

//     // Download PDF
//     const file = exportTask.result.files[0];
//     const pdfRes = await fetch(file.url);
//     const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

//     return new NextResponse(pdfBuffer, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": 'inline; filename="Presentation.pdf"',
//       },
//     });
//   } catch (err: any) {
//     console.error("Error converting PPTX to PDF:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


//serving PPTX as BLOB

// 'use server';

// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import PptxGenJS from "pptxgenjs";

// // Type definitions for slides
// interface SlideData {
//   title: string;
//   text: string;
//   image?: string;
// }

// interface PPTData {
//   references: string[];
//   slides: SlideData[];
// }

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// async function generatePPTStreamData(data: PPTData): Promise<ArrayBuffer> {
//   const pptx = new PptxGenJS();

//   data.slides.forEach((slideData) => {
//     const slide = pptx.addSlide();

//     // Slide Title
//     slide.addText(slideData.title, {
//       x: 0.5,
//       y: 0.5,
//       fontSize: 24,
//       bold: true,
//     });

//     // Slide Text
//     slide.addText(slideData.text, {
//       x: 0.5,
//       y: 1.2,
//       fontSize: 14,
//       color: "363636",
//       w: 8,
//     });

//     // Slide Image (if available)
//     if (slideData.image) {
//       slide.addImage({
//         path: slideData.image,
//         x: 0.5,
//         y: 2,
//         w: 7,
//         h: 3.5,
//       });
//     }
//   });

//   const result = await pptx.write({ outputType: "arraybuffer" });
//   if (result instanceof ArrayBuffer) {
//     return result;
//   } else if (result instanceof Uint8Array) {
//     return result.buffer instanceof ArrayBuffer && !(result.buffer instanceof SharedArrayBuffer)
//       ? result.buffer
//       : new Uint8Array(result).buffer;
//   } else if (typeof result === "string") {
//     // Convert base64 string to ArrayBuffer
//     const binaryString = atob(result);
//     const len = binaryString.length;
//     const bytes = new Uint8Array(len);
//     for (let i = 0; i < len; i++) {
//       bytes[i] = binaryString.charCodeAt(i);
//     }
//     return bytes.buffer;
//   } else if (result instanceof Blob) {
//     return await result.arrayBuffer();
//   } else {
//     throw new Error("Unexpected PPTX output type");
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { title } = (await req.json()) as { title: string };

//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const prompt = `
// You are helping generate structured content for a PowerPoint presentation using pptxgenjs.

// Input: ${title}

// Task:
// 1. Search or infer and provide 3–6 reference websites related to the title.
// 2. Create a presentation plan of 5–8 slides.
//    Each slide must have:
//    - title (short, 3–6 words)
//    - text (1–3 sentences, concise)
//    - image (relevant image link from websites)

// Output JSON strictly in this format:
// {
//   "references": ["url1", "url2", "url3"],
//   "slides": [
//     { "title": "Slide 1 Title", "text": "Short content.", "image": "https://..." },
//     { "title": "Slide 2 Title", "text": "Short content.", "image": "https://..." }
//   ]
// }
// No markdown, only JSON.
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;

//     let text = await response.text();

//     // Clean up JSON (sometimes Gemini outputs ```json ... ```)
//     if (text.startsWith("```")) {
//       text = text.replace(/```json|```/g, "").trim();
//     }

//     const data: PPTData = JSON.parse(text);

//     // Generate PPT buffer
//     const buffer = await generatePPTStreamData(data);

//     return new NextResponse(Buffer.from(buffer), {
//       headers: {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//         "Content-Disposition": 'attachment; filename="ServerPresentation.pptx"',
//       },
//     });
//   } catch (err: unknown) {
//     console.error("Error generating PPT:", err);
//     if(err instanceof Error){
//     return NextResponse.json({ error: err.message }, { status: 500 });
//     }
//   }
// }
