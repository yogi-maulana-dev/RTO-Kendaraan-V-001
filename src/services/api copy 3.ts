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
        user_id: data.user_id, // Mengirimkan user_id untuk proses verifikasi lebih lanjut
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
  user_id?: number;
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

// Definisi tipe untuk data respons pendaftaran
export interface RegisterResponseData {
  user_id?: number;
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
 * @param user_id ID user yang akan diverifikasi
 * @param token Token verifikasi yang dikirim ke email
 * @returns Promise dengan hasil verifikasi
 */
export const verifyAccount = async (
  user_id: number | string,
  token: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/verify_token.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Verifikasi gagal",
      };
    }

    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan jaringan saat verifikasi",
    };
  }
};

/**
 * Fungsi untuk mengirim ulang token verifikasi
 * @param email Email pengguna
 * @returns Promise dengan informasi hasil pengiriman ulang token
 */
export const resendVerificationToken = async (
  email: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/resend-verification.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          data.message ||
          `Error ${response.status}: Gagal mengirim ulang kode verifikasi`,
      };
    }

    return {
      success: data.success,
      message: data.message,
      data: data,
    };
  } catch (error) {
    console.error(
      "Resend verification error:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      message: "Terjadi kesalahan jaringan",
    };
  }
};

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
  user_id: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/hapus-data.php`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus data:", error);
    return { success: false, message: "Gagal menghubungi server" };
  }
};
