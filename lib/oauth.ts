import axios from "axios";

const CALENDLY_AUTH_BASE = "https://auth.calendly.com/oauth";
const CALENDLY_API_BASE = "https://api.calendly.com";

export interface CalendlyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  owner: string;
  organization: string;
}

export interface CalendlyUser {
  resource: {
    uri: string;
    name: string;
    email: string;
    scheduling_url: string;
    timezone: string;
    avatar_url: string | null;
    current_organization: string;
  };
}

/**
 * Builds the Calendly OAuth authorization URL
 */
export function buildCalendlyAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.CALENDLY_CLIENT_ID!,
    redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
    response_type: "code",
  });

  return `${CALENDLY_AUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchanges an authorization code for an access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<CalendlyTokenResponse> {
  const credentials = Buffer.from(
    `${process.env.CALENDLY_CLIENT_ID}:${process.env.CALENDLY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post<CalendlyTokenResponse>(
    `${CALENDLY_AUTH_BASE}/token`,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return response.data;
}

/**
 * Refreshes an expired Calendly access token
 */
export async function refreshCalendlyToken(
  refreshToken: string
): Promise<CalendlyTokenResponse> {
  const credentials = Buffer.from(
    `${process.env.CALENDLY_CLIENT_ID}:${process.env.CALENDLY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post<CalendlyTokenResponse>(
    `${CALENDLY_AUTH_BASE}/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return response.data;
}

/**
 * Fetches the authenticated Calendly user info
 */
export async function getCalendlyUser(
  accessToken: string
): Promise<CalendlyUser> {
  const response = await axios.get<CalendlyUser>(
    `${CALENDLY_API_BASE}/users/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/**
 * Computes the token expiry date from expires_in (seconds)
 */
export function computeTokenExpiry(expiresIn: number): string {
  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

/**
 * Checks if a token expiry date has passed (with 5-minute buffer)
 */
export function isTokenExpired(expiryIso: string): boolean {
  const expiry = new Date(expiryIso).getTime();
  const buffer = 5 * 60 * 1000; // 5 minutes
  return Date.now() + buffer >= expiry;
}
