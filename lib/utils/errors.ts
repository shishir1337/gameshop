/**
 * Error handling utilities
 * Provides sanitized error messages for production
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isPublic: boolean = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Sanitize error message for client response
 */
export function sanitizeError(error: unknown): {
  message: string;
  statusCode: number;
} {
  // Log the full error server-side
  if (error instanceof Error) {
    console.error("Error:", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      name: error.name,
    });
  } else {
    console.error("Unknown error:", error);
  }

  // Return sanitized error for client
  if (error instanceof AppError) {
    return {
      message: error.isPublic ? error.message : "An error occurred",
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    // In development, show actual error messages
    if (process.env.NODE_ENV === "development") {
      return {
        message: error.message,
        statusCode: 500,
      };
    }

    // In production, hide internal error details
    return {
      message: "An internal error occurred. Please try again later.",
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown): Response {
  const { message, statusCode } = sanitizeError(error);
  return Response.json({ error: message }, { status: statusCode });
}

