import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  const supabase = createRouteHandlerSupabaseClient(request, response);

  try {
    const { apiKey } = await request.json();

    if (!apiKey || !apiKey.startsWith("cal_")) {
      return NextResponse.json({ error: "Cle API invalide. Elle doit commencer par cal_" }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const ownerUri = `cal:${user.id}`;

    await supabase.from("users").upsert({
      id: user.id,
      email: user.email!,
      calendly_access_token: apiKey,
      calendly_refresh_token: null,
      calendly_token_expiry: null,
      calendly_user_uri: ownerUri,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cal-connect]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.redirect(`${APP_URL}/dashboard`);
}
