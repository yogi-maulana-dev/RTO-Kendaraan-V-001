import React, { useState } from 'react';
import { insertUser } from '../services/api';
import Swal from 'sweetalert2';

const TambahUserForm: React.FC<{ onUserAdded: () => void }> = ({ onUserAdded }) => {
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        email: '',
        no_telepon: '',
        alamat: '',
        password: '', // Properti baru
        tanggal_daftar: new Date().toISOString() // Properti baru (otomatis)
    });

    const [isSubmitting, setIsSubmitting] = useState(false); // State untuk mencegah klik ganda

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isSubmitting) return; // Cegah perubahan jika sedang submit
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true); // Mencegah klik ganda

        console.log("Mengirim data ke API:", formData); // Debugging

        try {
            const result = await insertUser(formData);
            console.log("Response dari API:", result); // Debugging

            if (result?.success) {
                setFormData({ nama_lengkap: "", alamat: "", no_telepon: "", email: "", password: "", tanggal_daftar: "" }); // Reset form
                onUserAdded(); // Refresh daftar pengguna

                // alert("Data berhasil ditambahkan!"); // Tampilkan alert
                await Swal.fire({
                    icon: "success",
                    title: "Sukses",
                    text: "Data berhasil ditambahkan!",
                });
            } else {
                await Swal.fire({
                    icon: "warning",
                    title: "Gagal",
                    text: "Gagal Data ditambahkan!",
                });
            }
        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            alert("Gagal menambahkan data.");
        } finally {
            setIsSubmitting(false); // Aktifkan kembali form
        }
    };

    return (
        <div>
            <h1>Tambah User</h1>
            <form onSubmit={handleSubmit} className='bg-white p-6 rounded-lg shadow-md'>
                <h2 className='text-xl font-bold mb-4 text-blue-600'></h2>
                <input
                    type='text'
                    name='nama_lengkap'
                    placeholder='Nama Lengkap'
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className='border border-gray-300 rounded-md p-2 mb-4 w-full'
                    required
                    disabled={isSubmitting} // Nonaktifkan input saat sedang submit
                />
                <input
                    type='text'
                    name='email'
                    placeholder='Email'
                    value={formData.email}
                    onChange={handleChange}
                    className='border border-gray-300 rounded-md p-2 mb-4 w-full'
                    required
                    disabled={isSubmitting} // Nonaktifkan input saat sedang submit
                />
                <input
                    type='password'
                    name='password'
                    placeholder='Password'
                    value={formData.password}
                    onChange={handleChange}
                    className="border border-gray-300 ronded-md p-2 mb-4 w-full"
                    required
                    disabled={isSubmitting}
                />
                <input
                    type="text"
                    name='no_telepon'
                    placeholder='No Telepon'
                    value={formData.no_telepon}
                    onChange={handleChange}
                    className='border border-gray-300 rounded-md p-2 mb-4 w-full'
                    required
                    disabled={isSubmitting}
                />

                <textarea
                    name="alamat"
                    placeholder="Alamat"
                    value={formData.alamat}
                    onChange={handleTextareaChange}
                    className="border border-gray-300 rounded-md p-2 mb-4 w-full h-24"
                    required // 3. Required tanpa nilai (boolean attribute)
                    disabled={isSubmitting}
                />

                <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white transition ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    disabled={isSubmitting} // Tombol dinonaktifkan jika sedang submit
                >
                    {isSubmitting ? "Menambahkan..." : "Tambah"}
                </button>
            </form>
        </div >
    );
};

export default TambahUserForm;