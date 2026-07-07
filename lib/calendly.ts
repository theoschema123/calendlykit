export interface CalendlyEventTypePayload {
  name: string;
  duration: number;
  description?: string;
  slug?: string;
}

export interface CreateEventTypeResult {
  name: string;
  success: boolean;
  scheduling_url?: string;
  error?: string;
}

async function createEventType(
  apiKey: string,
  payload: CalendlyEventTypePayload
): Promise<CreateEventTypeResult> {
  try {
    const slug = payload.slug ||
      payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const res = await fetch("https://api.cal.com/v2/event-types", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-06-14",
      },
      body: JSON.stringify({
        title: payload.name,
        slug,
        description: payload.description ?? "",
        lengthInMinutes: payload.duration,
        locations: [{ type: "integration", integration: "cal-video" }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { name: payload.name, success: false, error: data.message ?? "Erreur API" };
    }

    return {
      name: payload.name,
      success: true,
      scheduling_url: `https://cal.com/${data.data?.slug ?? slug}`,
    };
  } catch (err) {
    return { name: payload.name, success: false, error: String(err) };
  }
}

export async function installTemplateEvents(
  apiKey: string,
  _ownerUri: string,
  events: CalendlyEventTypePayload[]
): Promise<CreateEventTypeResult[]> {
  const results: CreateEventTypeResult[] = [];
  for (const event of events) {
    const result = await createEventType(apiKey, event);
    results.push(result);
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}
