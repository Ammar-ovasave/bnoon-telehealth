import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const CONTAINER_NAME = "id-documents";
const STORAGE_BASE_URL = "https://bnoonstorage.blob.core.windows.net/id-documents/";

function getStorageClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Azure Storage connection string not configured");
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

// POST - Upload file to temp folder
export async function POST(request: NextRequest) {
  try {
    const containerClient = getStorageClient();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and PDF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename - always upload to temp folder first
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobName = `temp/${sessionId || "unknown"}/${timestamp}_${safeFileName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type,
      },
      metadata: {
        sessionId: sessionId || "unknown",
        uploadedAt: new Date().toISOString(),
        originalFileName: file.name,
        status: "temp",
      },
    });

    return NextResponse.json({
      success: true,
      url: blockBlobClient.url,
      fileName: file.name,
      blobName: blobName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// PUT - Move file from temp to permanent location (called after booking confirmation)
export async function PUT(request: NextRequest) {
  try {
    const containerClient = getStorageClient();

    const { tempUrl, patientMrn } = await request.json();
    if (!tempUrl || !patientMrn) {
      return NextResponse.json(
        { error: "tempUrl and patientMrn are required" },
        { status: 400 }
      );
    }

    // Extract blob name from URL
    if (!tempUrl.startsWith(STORAGE_BASE_URL)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const tempBlobName = decodeURIComponent(tempUrl.replace(STORAGE_BASE_URL, ""));

    // Generate new permanent path
    const fileName = tempBlobName.split("/").pop();
    const permanentBlobName = `patients/${patientMrn}/${fileName}`;

    // Copy to permanent location
    const sourceBlobClient = containerClient.getBlockBlobClient(tempBlobName);
    const destBlobClient = containerClient.getBlockBlobClient(permanentBlobName);

    // Start copy operation
    const copyPoller = await destBlobClient.beginCopyFromURL(sourceBlobClient.url);
    await copyPoller.pollUntilDone();

    // Update metadata on the new blob
    await destBlobClient.setMetadata({
      patientMrn: patientMrn,
      movedAt: new Date().toISOString(),
      status: "permanent",
    });

    // Delete the temp file
    await sourceBlobClient.deleteIfExists();

    return NextResponse.json({
      success: true,
      url: destBlobClient.url,
    });
  } catch (error) {
    console.error("Move error:", error);
    return NextResponse.json(
      { error: "Failed to move file" },
      { status: 500 }
    );
  }
}

// GET - Check if file exists
export async function GET(request: NextRequest) {
  try {
    const containerClient = getStorageClient();

    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract blob name from URL
    if (!url.startsWith(STORAGE_BASE_URL)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const blobName = decodeURIComponent(url.replace(STORAGE_BASE_URL, ""));

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blockBlobClient.exists();

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Check file error:", error);
    return NextResponse.json(
      { error: "Failed to check file", exists: false },
      { status: 500 }
    );
  }
}

// DELETE - Remove file from blob storage
export async function DELETE(request: NextRequest) {
  try {
    const containerClient = getStorageClient();

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract blob name from URL
    if (!url.startsWith(STORAGE_BASE_URL)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const blobName = decodeURIComponent(url.replace(STORAGE_BASE_URL, ""));

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
