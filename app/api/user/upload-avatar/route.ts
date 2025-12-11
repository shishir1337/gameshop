import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomBytes } from "crypto";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * Validate file content by checking magic bytes
 */
function validateImageContent(buffer: Buffer): { valid: boolean; mimeType?: string } {
  // Check magic bytes for common image formats
  const signatures: Record<string, Buffer> = {
    "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
    "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/gif": Buffer.from([0x47, 0x49, 0x46, 0x38]),
    "image/webp": Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF header, need to check more
  };

  for (const [mimeType, signature] of Object.entries(signatures)) {
    if (buffer.subarray(0, signature.length).equals(signature)) {
      // For WebP, check for WEBP string at offset 8
      if (mimeType === "image/webp") {
        const webpCheck = buffer.subarray(8, 12).toString("ascii");
        if (webpCheck === "WEBP") {
          return { valid: true, mimeType };
        }
      } else {
        return { valid: true, mimeType };
      }
    }
  }

  return { valid: false };
}

/**
 * POST /api/user/upload-avatar
 * Upload user avatar image
 * TODO: Migrate to ImageKit for production
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type by MIME type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit." },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file content by magic bytes (prevent MIME type spoofing)
    const contentValidation = validateImageContent(buffer);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: "Invalid file content. File does not match its declared type." },
        { status: 400 }
      );
    }

    // Sanitize filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file extension." },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate cryptographically secure unique filename
    const timestamp = Date.now();
    const randomString = randomBytes(16).toString("hex");
    const filename = `${session.user.id}-${timestamp}-${randomString}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/avatars/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      message: "Avatar uploaded successfully",
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

