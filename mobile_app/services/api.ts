import { getToken } from "./auth";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined");
}

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