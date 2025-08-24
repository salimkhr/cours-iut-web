import axios from "axios";
import User from "@/types/User";

export type UsersQuery = {
  q?: string;
  role?: string; // UserRole | 'all' already filtered in component before sending
  extraTime?: string; // 'true' | 'false'
  groupe?: string; // 'F' | 'G'
};

export type UserPayload = Omit<User, "_id">;

export default function useAdminUsersApi() {
  async function listUsers(params: UsersQuery) {
    const res = await axios.get("/api/admin/users", { params });
    return (res.data.users || []) as User[];
  }

  async function addUser(data: UserPayload) {
    const res = await axios.post("/api/admin/users", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.user as User;
  }

  async function editUser(id: string, data: UserPayload) {
    const res = await axios.put(`/api/admin/users/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.user as User;
  }

  async function deleteUser(id: string) {
    await axios.delete(`/api/admin/users/${id}`);
  }

  return { listUsers, addUser, editUser, deleteUser };
}
