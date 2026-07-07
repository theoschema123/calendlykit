import axios, { AxiosError } from "axios";

const CALENDLY_API_BASE = "https://api.calendly.com";

export interface CalendlyEventTypePayload {
  name: string;
  duration: number;
  description?: string;
  slug?: string;
}

export interface CalendlyEventTypeResponse {
  resource: {
    uri: string;
    name: string;
    slug: string;
    scheduling_url: string;
    duration: number;
    description_plain: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateEventTypeResult {
  name: string;
  success: boolean;
  uri?: string;
  scheduling_url?: string;
  error?: string;
}

/**
 * Creates a single event type for a Calendly user
 */
export async function createEventType(
  accessToken: string,
  ownerUri: string,
  payload: CalendlyEventTypePayload
): Promise<CreateEventTypeResult> {
  try {
    // Generate a slug from the name if not provided
    const slug =
      payload.slug ||
      payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const response = await axios.post<CalendlyEventTypeResponse>(
      `${CALENDLY_API_BASE}/event_types`,
      {
        name: payload.name,
        host: ownerUri,
        duration: payload.duration,
        description_html: payload.description
          ? `<p>${payload.description}</p>`
          : undefined,
        slug,
        color: getRandomEventColor(),
        kind: "solo",
        type: "StandardEventType",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      name: payload.name,
      success: true,
      uri: response.data.resource.uri,
      scheduling_url: response.data.resource.scheduling_url,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; title?: string }>;
    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      "Unknown error";

    return {
      name: payload.name,
      success: false,
      error: message,
    };
  }
}

/**
 * Creates multiple event types from a template, returning results for each
 */
export async function installTemplateEvents(
  accessToken: string,
  ownerUri: string,
  events: CalendlyEventTypePayload[]
): Promise<CreateEventTypeResult[]> {
  const results: CreateEventTypeResult[] = [];

  for (const event of events) {
    const result = await createEventType(accessToken, ownerUri, event);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Lists existing event types for a user
 */
export async function listEventTypes(
  accessToken: string,
  userUri: string
): Promise<{ uri: string; name: string; status: string }[]> {
  const response = await axios.get(`${CALENDLY_API_BASE}/event_types`, {
    params: {
      user: userUri,
      count: 100,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return response.data.collection.map(
    (et: { uri: string; name: string; status: string }) => ({
      uri: et.uri,
      name: et.name,
      status: et.status,
    })
  );
}

function getRandomEventColor(): string {
  const colors = [
    "#0069ff",
    "#00a2ff",
    "#00bf6e",
    "#e34444",
    "#e8732a",
    "#e8c72a",
    "#9d44e8",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
