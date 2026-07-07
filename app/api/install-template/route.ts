import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { getTemplateById } from "@/lib/templates";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createRouteHandlerSupabaseClient(request, response);

  try {
    const body = await request.json();
    const { templateId } = body as { templateId: string };

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

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
      .select("calendly_access_token")
      .eq("id", user.id)
      .single();

    if (!userData?.calendly_access_token) {
      return NextResponse.json({ error: "Cal.com not connected" }, { status: 403 });
    }

    // Return the API key and events to the client — client will call Cal.com directly
    return NextResponse.json({
      apiKey: userData.calendly_access_token,
      events: template.events,
      templateName: template.name,
    });
  } catch (err) {
    console.error("[install-template]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
