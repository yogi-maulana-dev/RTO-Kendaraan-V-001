import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

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
