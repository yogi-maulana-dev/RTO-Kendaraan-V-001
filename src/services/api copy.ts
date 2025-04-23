import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login Gagal",
      };
    }

    return {
      success: true,
      token: data.token,
    };
  } catch (error) {
    console.error("Login Error", error);
    return {
      success: false,
      message: "Jaringan Error",
    };
  }
};

export interface User {
  user_id?: number;
  nama_lengkap: string;
  alamat: string;
  no_telepon: string;
  email: string;
  password: string;
  tanggal_daftar: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/getData.php`);
    return response.data.data;
  } catch (error) {
    console.error("Error mengambil users : ", error);
    return [];
  }
};
