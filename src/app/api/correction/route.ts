import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient} from "@prisma/client";


const prismaClient = new PrismaClient();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest){

   
const {edit_statement , slides , conversation_id} = await req.json()


  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are updating an existing presentation based on user edits.  

Input:
- userRequest: "${edit_statement}"
- previousSlides: ${JSON.stringify(slides)}

Task:
1. Identify which slides need to be updated or replaced based on the userRequest.
2. Generate only those updated slides as structured data.
3. Also include a short response text (1–2 sentences) summarizing what was changed or improved.

Output format (strict JSON):
{
  "updatedSlides": [
    {
      "index": number (slide index starting from 0),
      "title": "Updated Slide Title",
      "text": "Short updated slide content.",
      "image": "https://working-image-link.jpg"
    }
  ],
  "responseText": "Short text describing what was updated."
}

Rules:
- Return only JSON, no markdown or extra text.
- Do not repeat slides that were not changed.
- Ensure image URLs are direct JPG/PNG/WebP links, not homepages or PDFs.


`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let text = await response.text();

    // Clean up JSON (sometimes Gemini outputs ```json ... ```)
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }
//add user prompt to db and response text to db
// update the slides data in the db
    
    const data = JSON.parse(text);
await prismaClient.msg.createMany({
    data: [
        {
            sender: 'user',
            content: edit_statement,
            conversationId:conversation_id
        },
        {
            sender: 'bot',
            content: data.responseText,
            conversationId:conversation_id
        }
    ]
})

const updatedSlides = data.updatedSlides 

for (const item of updatedSlides){
    const id = slides[item.index].id
    await prismaClient.slide.update({where:{id}, data:{title:item.title, text:item.text, image:item.image}})
}

data.slides = await prismaClient.slide.findMany({where:{conversationId:conversation_id}})

return NextResponse.json({msg:'changed the data' , data })
}

