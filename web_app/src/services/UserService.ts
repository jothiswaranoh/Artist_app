import { apiService } from './api';

export interface User {
    id: string;
    email: string;
    role: string;
    status?: string;
    created_at: string | null;
    name?: string;
    phone?: string;
    address?: string;
    loyalty_status?: string;
    preferences?: string;
    artist_profile?: any;
    artist_profile_attributes?: {
        city?: string;
        bio?: string;
        is_approved?: boolean;
    };
}

export interface PaginationMeta {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
    active_count?: number;
    new_this_week_count?: number;
}

export const UserService = {
  getAllUsers: async (
    page = 1,
    perPage = 10,
    role?: string,
  ): Promise<{ data: User[]; meta: PaginationMeta }> => {
    const params: { page: number; per_page: number; role?: string } = {
      page,
      per_page: perPage,
    };

    if (role) params.role = role;

    const response = await apiService.get("/users", params);

    const users: User[] = (response.data ?? []).map((user: any) => ({
      id: String(user.id),
      email: user.email ?? "",
      role: user.role ?? "customer",
      status: user.status ?? null,
      created_at: user.created_at ?? null,
      name: user.name ?? null,
      phone: user.phone ?? null,
      address: user.address ?? null,
      loyalty_status: user.loyalty_status ?? null,
      preferences: user.preferences ?? null,
      artist_profile: user.artist_profile ?? null,
      artist_profile_attributes: user.artist_profile_attributes ?? null,
    }));

    return {
      data: users,
      meta: response.meta ?? {
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 1,
        total_count: 0,
      },
    };
  },

  createUser: async (
    userData: Partial<User> & {
      password?: string;
      password_confirmation?: string;
    },
  ) => {
    const response = await apiService.post("/users", { user: userData });
    return response.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await apiService.patch(`/users/${id}`, {
      user: { status },
    });
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await apiService.patch(`/users/${id}`, { user: userData });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiService.delete(`/users/${id}`);
    return response.data;
  },
};
