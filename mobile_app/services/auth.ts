import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";

/**
 * Save token
 */
export const setToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get token
 */
export const getToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

/**
 * Remove token
 */
export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};