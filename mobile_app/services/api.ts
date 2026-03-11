import { getToken } from "./auth";

const BASE_URL = "http://10.245.8.82:3000/api/v1";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await getToken();

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
    console.error("API Error:", text);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};