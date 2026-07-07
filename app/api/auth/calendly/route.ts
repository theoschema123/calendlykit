import { NextResponse } from "next/server";
import { buildCalendlyAuthUrl } from "@/lib/oauth";

export async function GET() {
  try {
    const authUrl = buildCalendlyAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[OAuth] Failed to build auth URL:", error);
    return NextResponse.redirect(
      new URL(
        "/dashboard?error=oauth_init_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
