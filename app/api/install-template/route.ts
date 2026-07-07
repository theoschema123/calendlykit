import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { getTemplateById } from "@/lib/templates";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createRouteHandlerSupabaseClient(request, response);

  try {
    const { templateId } = await request.json();

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("calendly_access_token, calendly_user_uri")
      .eq("id", user.id)
      .single();

    if (!userData?.calendly_access_token || !userData?.calendly_user_uri) {
      return NextResponse.json({ error: "Calendly not connected" }, { status: 403 });
    }

    return NextResponse.json({
      token: userData.calendly_access_token,
      ownerUri: userData.calendly_user_uri,
      events: template.events,
      templateName: template.name,
    });
  } catch (err) {
    console.error("[install-template]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
