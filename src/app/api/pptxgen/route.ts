import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

interface Slide {
  title: string;
  text: string;
  image?: string;
}

export async function POST(req: NextRequest) {
  const { slides } = await req.json();

  const pptx = new PptxGenJS();

  // Loop through slides JSON
slides.forEach((slide: Slide, index: number) => {
  const s = pptx.addSlide();

  // Green Background (right ~60% of slide)
  s.addShape(pptx.ShapeType.rect, {
    x: 3,        // start at 40% of slide width
    y: 0,
    w:'70%',        // remaining 60%
    h: '100%',
    fill: { color: "4B5563" },
    line: { color: "4B5563" },
  });

  // Image (left side)
  if (slide.image) {
    s.addImage({
      path: slide.image,
      x: 0.7,
      y: 1.1,
      w: '30%',
      h: '70%',
      
    });
  }

  // Title inside green section
  s.addText(slide.title, {
    x: 4,
    y: 1.2,
    w: '60%',
    h: 1,
    align: "center",
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    valign: "middle",
    wrap: true,
  });

  // Subtitle inside green section
  s.addText(slide.text, {
    x: 4,
    y: 2.5,
    w: '60%',
    h: 0.8,
    color: "FFFFFF",
    fontSize: 16,
    valign: "top",
    wrap: true,
  });

  // Page number (bottom right)
  s.addText(`${index + 1} / ${slides.length}`, {
    x: "95%",
    y: "95%",
    w: 1.2,
    h: 0.4,
    fontSize: 12,
    color: "DDDDDD",
    align: "right",
    valign: "bottom",
  });
});



  // Generate PPT as base64 and send as blob response
  const pptBuffer = await pptx.write({ outputType: "nodebuffer" });

  // Convert pptBuffer (ArrayBuffer, Uint8Array, or Blob) to Buffer for NextResponse
  let buffer: Buffer;
  if (pptBuffer instanceof ArrayBuffer) {
    buffer = Buffer.from(new Uint8Array(pptBuffer));
  } else if (pptBuffer instanceof Uint8Array) {
    buffer = Buffer.from(pptBuffer);
  } else if (typeof pptBuffer === "string") {
    buffer = Buffer.from(pptBuffer, "base64");
  } else if (pptBuffer instanceof Blob) {
    // Convert Blob to ArrayBuffer, then to Buffer
    const arrayBuffer = await pptBuffer.arrayBuffer();
    buffer = Buffer.from(new Uint8Array(arrayBuffer));
  } else {
    throw new Error("Unsupported pptBuffer type");
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename=slides.pptx`,
    },
  });
}
