import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

export async function POST(req: NextRequest) {
  const { slides } = await req.json();

  const pptx = new PptxGenJS();

  // Loop through slides JSON
  slides.forEach((slide: any, index: number) => {
    const s = pptx.addSlide();

// Solid background color (use a single color as gradients are not supported)
s.background = {
  fill: "4B5563" // gray-600 as solid background color
};

// gray-600 (#4B5563) as background (gradient not supported)

    // Title
    s.addText(slide.title, {
      x: 0.5,
      y: 0.3,
      w: "90%",
      h: 1,
      align: "center",
      fontSize: 28,
      bold: true,
      color: "FFFFFF",
    });

    // Image
    if (slide.image) {
      s.addImage({
        path: slide.image,
        x: "10%",
        y: 1.5,
        w: "80%",
        h: 3.5,
      });
    }

    // Text
    s.addText(slide.text, {
      x: 0.7,
      y: 5.2,
      w: "85%",
      h: 1.5,
      align: "center",
      fontSize: 16,
      color: "FFFFFF",
    });

    // Page number
    s.addText(`${index + 1} / ${slides.length}`, {
      x: 9,
      y: 6.5,
      fontSize: 12,
      color: "DDDDDD",
      align: "right",
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
