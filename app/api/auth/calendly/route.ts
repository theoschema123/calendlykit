import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(`${APP_URL}/dashboard?connected=true`);
  const supabase = createRouteHandlerSupabaseClient(request, response);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(`${APP_URL}/login?error=not_authenticated`);
    }

    const calApiKey = process.env.CAL_API_KEY!;

    const calRes = await fetch("https://api.cal.com/v2/me", {
      headers: {
        Authorization: `Bearer ${calApiKey}`,
        "cal-api-version": "2024-06-14",
      },
    });

    if (!calRes.ok) {
      return NextResponse.redirect(`${APP_URL}/dashboard?error=cal_api_error`);
    }

    const calData = await calRes.json();
    const ownerUri = `cal:${calData.data?.id ?? user.id}`;

    const admin = createAdminSupabaseClient();
    await admin.from("users").upsert({
      id: user.id,
      email: user.email!,
      calendly_access_token: calApiKey,
      calendly_refresh_token: null,
      calendly_token_expiry: null,
      calendly_user_uri: ownerUri,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    return response;
  } catch (err) {
    console.error("[cal-connect]", err);
    return NextResponse.redirect(`${APP_URL}/dashboard?error=connection_failed`);
  }
}
