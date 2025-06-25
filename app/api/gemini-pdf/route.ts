import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = 'AIzaSyC_gmJdmNFZlIaUVup5DGlz-4cw86AKdis';

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set in environment" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    // Lee el PDF como base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

    // Inicializa el cliente de Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Usa el modelo actualizado soportado
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt personalizado
    const prompt = "Resume el contenido de este PDF en JSON estructurado.";
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Pdf,
              },
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      summary: "PDF analizado por Gemini",
      fileName: (file as File).name || "uploaded.pdf",
      fileSize: (file as File).size,
      contentType: (file as File).type,
      gemini: text,
    });
  } catch (error) {
    console.error("Error en análisis Gemini:", error);
    return NextResponse.json({ error: "Error procesando PDF con Gemini" }, { status: 500 });
  }
} 