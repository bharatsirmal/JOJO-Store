import { NextResponse } from "next/server";
export function adminError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unable to complete this action.";
  const status =
    message === "Unauthorized"
      ? 401
      : message === "Forbidden"
        ? 403
        : message.toLowerCase().includes("not found")
          ? 404
          : 400;
  return NextResponse.json({ error: message }, { status });
}
