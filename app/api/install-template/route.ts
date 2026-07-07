import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { getTemplateById } from "@/lib/templates";
import { installTemplateEvents } from "@/lib/calendly";
import {
  isTokenExpired,
  refreshCalendlyToken,
  computeTokenExpiry,
} from "@/lib/oauth";

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
      return NextResponse.json({ error: `Template "${templateId}" not found` }, { status: 404 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("calendly_access_token, calendly_refresh_token, calendly_token_expiry, calendly_user_uri")
      .eq("id", user.id)
      .single();

    if (dbError || !userData) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (!userData.calendly_access_token || !userData.calendly_user_uri) {
      return NextResponse.json(
        { error: "Calendly not connected. Please connect your account first." },
        { status: 403 }
      );
    }

    let accessToken = userData.calendly_access_token;

    // Auto-refresh token if expired
    if (
      userData.calendly_token_expiry &&
      isTokenExpired(userData.calendly_token_expiry) &&
      userData.calendly_refresh_token
    ) {
      try {
        const refreshed = await refreshCalendlyToken(userData.calendly_refresh_token);
        accessToken = refreshed.access_token;

        await supabase
          .from("users")
          .update({
            calendly_access_token: refreshed.access_token,
            calendly_refresh_token: refreshed.refresh_token,
            calendly_token_expiry: computeTokenExpiry(refreshed.expires_in),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch {
        return NextResponse.json(
          { error: "Calendly session expired. Please reconnect your account." },
          { status: 403 }
        );
      }
    }

    const results = await installTemplateEvents(
      accessToken,
      userData.calendly_user_uri,
      template.events
    );

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    const status = failCount === 0 ? "success" : successCount > 0 ? "partial" : "failed";

    await supabase.from("installed_templates").insert({
      user_id: user.id,
      template_id: templateId,
      template_name: template.name,
      event_count: successCount,
      status,
    });

    return NextResponse.json({
      success: true,
      status,
      template: template.name,
      results,
      summary: { total: results.length, created: successCount, failed: failCount },
    });
  } catch (err) {
    console.error("[install-template]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
