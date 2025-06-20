import { NextRequest, NextResponse } from "next/server";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { Readable } from "stream";

// Constants
const SUPPORTED_MIME_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * @swagger
 * /api/process-document:
 *   post:
 *     summary: Process a document using Google Document AI
 *     description: Upload and process a document (PDF or image) using Google Document AI
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document processed successfully
 *       400:
 *         description: Invalid file or request
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
  try {
    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const mimeType = file.type;
    if (!Object.keys(SUPPORTED_MIME_TYPES).includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString("base64");

    // Initialize Document AI client
    const client = new DocumentProcessorServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us";
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

    if (!projectId || !processorId) {
      throw new Error("Missing required environment variables");
    }

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Prepare the request
    const docAiRequest = {
      name,
      rawDocument: {
        content: base64Content,
        mimeType: mimeType,
      },
      skipHumanReview: true,
    };

    // Process the document
    const [result] = await client.processDocument(docAiRequest);
    const { document } = result;

    // Extract relevant information from the response
    const processedDocument = {
      text: document?.text,
      pages: document?.pages?.map((page) => ({
        pageNumber: page.pageNumber,
        width: page.dimension?.width,
        height: page.dimension?.height,
        confidence: page.layout?.confidence,
      })),
      entities: document?.entities?.map((entity) => ({
        type: entity.type,
        mentionText: entity.mentionText,
        confidence: entity.confidence,
      })),
    };

    return NextResponse.json(processedDocument);
  } catch (error) {
    console.error("Error processing document:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "Authentication error. Please check your Google Cloud credentials." },
          { status: 401 }
        );
      }
      if (error.message.includes("permission")) {
        return NextResponse.json(
          { error: "Permission denied. Please check your Google Cloud permissions." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
} 
