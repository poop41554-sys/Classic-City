import { apiRequest } from "./queryClient";

export async function logout() {
  try {
    await apiRequest("POST", "/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
  window.location.href = "/";
}
