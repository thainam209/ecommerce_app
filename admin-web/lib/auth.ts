import * as SecureStore from "expo-secure-store";

export async function getAuthToken() {
  return await SecureStore.getItemAsync("token");
}

export async function getAuthUser() {
  const json = await SecureStore.getItemAsync("user");
  return json ? JSON.parse(json) : null;
}
