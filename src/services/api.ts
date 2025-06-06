import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api"; // Gunakan ini sebagai base API

// Definisi tipe untuk data pengguna
export interface UserData {
  nama_lengkap: string;
  alamat: string;
  no_telepon: string;
  email: string;
  password: string;
}

// services/api.ts
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }), // Sesuaikan dengan field yang diharapkan backend
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    // Menambahkan penanganan untuk status verifikasi email
    if (data.need_verification) {
      return {
        success: false,
        message: data.message || "Email perlu diverifikasi",
        need_verification: true, // Memberikan informasi bahwa verifikasi diperlukan
        admin_id: data.admin_id, // Mengirimkan admin_id untuk proses verifikasi lebih lanjut
      };
    }

    return {
      success: true,
      token: data.token, // Token yang diterima setelah login sukses
      message: data.message || "Login berhasil", // Pesan sukses login
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error",
    };
  }
};

// services/api.ts

export interface User {
  admin_id?: number;
  nama_lengkap: string;
  alamat: string;
  no_telepon: string;
  email: string;
  password: string;
  tanggal_daftar: string;
}

// services/api.ts

export const verifyToken = async (
  email: string | null,
  // userId: string | null,
  token: string | null
) => {
  if (!email || !token) {
    return {
      success: false,
      message: "User Email atau token tidak valid",
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/verify-token.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ userId, token }),
      body: JSON.stringify({ email, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Verifikasi gagal",
      };
    }

    return {
      success: true,
      message: "Verifikasi berhasil!",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan jaringan",
    };
  }
};

// Ambil status database (cek apakah koneksi MySQL berjalan)
export const getDatabaseStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/db.php`);
    return response.data; // Pastikan response memiliki struktur { status: "success", message: "Database connected" }
  } catch (error) {
    console.error("Error fetching database status:", error);
    return { status: "error", message: "Database connection failed" };
  }
};

export const resendToken = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/resend-token.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Ambil respons mentah
    const rawText = await response.text();
    console.log("Raw response:", rawText); // Log respons mentah dari server

    // Parsing respons sebagai JSON jika valid
    const data = JSON.parse(rawText);
    return data;
  } catch (error) {
    console.error("Resend token error:", error);
    return { success: false, message: "Terjadi kesalahan jaringan" };
  }
};

// Definisi tipe untuk data respons pendaftaran
export interface RegisterResponseData {
  admin_id?: number;
  message?: string;
}

// Definisi tipe untuk respons API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Definisi tipe untuk data login
export interface LoginData {
  email: string;
  password: string;
}

// Definisi tipe untuk data verifikasi
export interface VerifyData {
  email: string;
  token: string;
}

/**
 * Fungsi untuk mendaftarkan pengguna baru
 * @param userData Data pengguna yang akan didaftarkan
 * @returns Promise dengan informasi hasil pendaftaran
 */
export const registerUser = async (
  userData: UserData
): Promise<ApiResponse<RegisterResponseData>> => {
  try {
    const response = await fetch(`${BASE_URL}/register.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    // Cek status HTTP response
    if (!response.ok) {
      console.error("HTTP error:", response.status, data);
      return {
        success: false,
        message: data.message || `Error ${response.status}: Registrasi gagal`,
      };
    }

    return {
      success: data.success,
      message: data.message,
      data: data as RegisterResponseData,
    };
  } catch (error) {
    console.error(
      "Registration error:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      message: "Terjadi kesalahan jaringan",
    };
  }
};
/**
 * Fungsi untuk memverifikasi akun dengan token
 * @param admin_id ID user yang akan diverifikasi
 * @param token Token verifikasi yang dikirim ke email
 * @returns Promise dengan hasil verifikasi
 */

// Ambil data users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/getData.php`);
    return response.data.data; // Pastikan response memiliki struktur { data: User[] }
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${BASE_URL}/forgot-password.php`, {
    // Tambah .php
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await response.json();
};

// Tambah data pengguna baru
// Reset password with token
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(`${BASE_URL}/reset-password.php`, {
      // Added .php extension
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Gagal reset password",
      };
    }

    return {
      success: true,
      message: data.message || "Password berhasil direset",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan jaringan",
    };
  }
};

// Fungsi untuk menambahkan user ke database
export const insertUser = async (userData: User) => {
  try {
    const response = await axios.post(`${BASE_URL}/tambah-data.php`, userData);
    return response.data; // Harus mengembalikan { success: boolean, message: string }
  } catch (error) {
    console.error("Error saat menambahkan user:", error);
    return { success: false, message: "Gagal menghubungi server" };
  }
};

// Fungsi untuk mengupdate data pengguna
export const updateUser = async (userData: User) => {
  try {
    const response = await axios.put(`${BASE_URL}/update-data.php`, userData);
    return response.data; // Harus mengembalikan { success: boolean, message: string }
  } catch (error) {
    console.error("Error saat mengupdate user:", error);
    return { success: false, message: "Gagal menghubungi server" };
  }
};

// Hapus user berdasarkan ID
export const deleteUser = async (
  admin_id: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/hapus-data.php`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ admin_id }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus data:", error);
    return { success: false, message: "Gagal menghubungi server" };
  }
};

export interface SIMData {
  sim_id?: number;
  user_id: number;
  nomor_sim: string;
  jenis_sim: "A" | "B" | "C" | "D";
  tanggal_terbit: string;
  tanggal_expired: string;
  status_sim?: "Aktif" | "Nonaktif" | "Ditangguhkan";
}

// CRUD operations
// export const getSIMs = async (admin_id: number) =>
//   axios.get(`${BASE_URL}/sim-list.php?admin_id=${admin_id}`);

export const getSIMs = async (): Promise<SIMData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/sim-list.php`);

    // Debugging response structure
    console.log("API Response:", response);

    if (!response.data) {
      throw new Error("Response data kosong");
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    throw new Error("Format response tidak valid");
  } catch (error) {
    console.error("Error fetching SIMs:", error);
    throw error;
  }
};

export const deleteSIM = async (sim_id: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/delete-sim.php`, {
      data: { sim_id },
    });
  } catch (error) {
    console.error("Error deleting SIM:", error);
    throw error;
  }
};

const validateUser = (data: any): data is User => {
  return (
    typeof data.user_id === "number" &&
    typeof data.nama_lengkap === "string" &&
    typeof data.no_telepon === "string" &&
    typeof data.email === "string"
  );
};

// Fungsi untuk pencarian user
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search-users.php`, {
      params: { search: query },
    });

    // Validasi response
    if (!Array.isArray(response.data)) {
      throw new Error("Format response tidak valid");
    }

    // Type checking untuk setiap item
    const validUsers = response.data.filter((item: any) => {
      const isValid = validateUser(item);
      if (!isValid) {
        console.warn("Data user tidak valid:", item);
      }
      return isValid;
    });

    return validUsers as User[];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// export const createSIM = async (simData: SIMData): Promise<void> => {
//   try {
//     const response = await axios.post(`${BASE_URL}/create-sim.php`, simData);
//     if (response.data.error) {
//       throw new Error(response.data.error);
//     }
//   } catch (error) {
//     console.error("Error creating SIM:", error);
//     throw error;
//   }
// };

// export const createSIM = async (simData: SIMData): Promise<SIMData> => {
//   try {
//     const response = await axios.post(`${BASE_URL}/create-sim.php`, simData);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       // Ambil pesan error dari response backend
//       const errorMessage =
//         error.response?.data?.error || "Gagal menyimpan data SIM";
//       throw new Error(errorMessage);
//     }
//     throw new Error("Terjadi kesalahan saat menyimpan data");
//   }
// };

// Contoh implementasi API service

interface ApiError {
  error: string;
  status?: number;
}

export const createSIM = async (simData: SIMData): Promise<SIMData> => {
  try {
    const response = await axios.post<SIMData>(
      `${BASE_URL}/create-sim.php`,
      simData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiError>(error)) {
      const serverError = error.response?.data;
      throw new Error(serverError?.error || "Gagal menyimpan data SIM");
    }
    throw new Error("Terjadi kesalahan tidak terduga");
  }
};

export const updateSIM = async (data: SIMData) =>
  axios.put(`${BASE_URL}/sim-update.php`, data);
