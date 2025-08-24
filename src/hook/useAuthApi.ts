import axios from "axios";

export default function useAuthApi() {
  async function login(login: string, password: string) {
    const response = await axios.post(
      "/api/login",
      { login, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data as { success?: boolean; error?: string };
  }

  return { login };
}
