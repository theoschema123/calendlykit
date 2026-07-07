import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import {
  exchangeCodeForToken,
  getCalendlyUser,
  computeTokenExpiry,
} from "@/lib/oauth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=calendly_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=missing_code`);
  }

  const response = NextResponse.redirect(`${APP_URL}/dashboard?connected=true`);
  const supabase = createRouteHandlerSupabaseClient(request, response);

  try {
    // Exchange OAuth code for tokens
    const tokenData = await exchangeCodeForToken(code);

    // Get the Calendly user URI
    const calendlyUser = await getCalendlyUser(tokenData.access_token);
    const ownerUri = calendlyUser.resource.uri;

    // Verify auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(`${APP_URL}/login?error=not_authenticated`);
    }

    // Upsert Calendly credentials
    const { error: dbError } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          calendly_access_token: tokenData.access_token,
          calendly_refresh_token: tokenData.refresh_token,
          calendly_token_expiry: computeTokenExpiry(tokenData.expires_in),
          calendly_user_uri: ownerUri,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (dbError) {
      console.error("[OAuth Callback] DB error:", dbError);
      return NextResponse.redirect(`${APP_URL}/dashboard?error=db_error`);
    }

    return response;
  } catch (err) {
    console.error("[OAuth Callback] Error:", err);
    return NextResponse.redirect(`${APP_URL}/dashboard?error=token_exchange_failed`);
  }
}
