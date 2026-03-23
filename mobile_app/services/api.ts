import { getToken } from "./auth";

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawBaseUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined");
}

const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

const BASE_URL = normalizedBaseUrl.endsWith("/api/v1")
  ? normalizedBaseUrl
  : normalizedBaseUrl.endsWith("/api")
    ? `${normalizedBaseUrl}/v1`
    : `${normalizedBaseUrl}/api/v1`;

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<any> => {
  const token = await getToken();
  try {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    console.log("API error response:", text);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}catch (error) {
    if (retries > 0) {
      await delay(1000);
      return apiRequest(endpoint, options, retries - 1);
    }

    throw error;
  }
};
