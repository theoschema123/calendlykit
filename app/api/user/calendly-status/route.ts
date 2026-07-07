import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createRouteHandlerSupabaseClient(request, response);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("calendly_access_token, calendly_user_uri, calendly_token_expiry")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError) {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({
      connected: !!(userData?.calendly_access_token && userData?.calendly_user_uri),
      userUri: userData?.calendly_user_uri ?? null,
      tokenExpiry: userData?.calendly_token_expiry ?? null,
    });
  } catch (err) {
    console.error("[calendly-status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
