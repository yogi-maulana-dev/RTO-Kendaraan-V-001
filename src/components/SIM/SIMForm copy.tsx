import { useState, useEffect } from "react";
import { SIMData, createSIM, updateSIM, searchUsers } from "../../services/api";
import Swal from 'sweetalert2';

interface Props {
    editingSim?: SIMData;
    onSuccess: () => void;
    user_id: number;
}

interface User {
    user_id: number;
    nama_lengkap: string;
    no_telepon: string;
    email: string;
}

export default function SIMForm({ editingSim, onSuccess, user_id }: Props) {
    const [form, setForm] = useState<SIMData>({
        user_id,
        nomor_sim: "",
        jenis_sim: "A",
        tanggal_terbit: "",
        tanggal_expired: "",
        status_sim: "Aktif",
    });

    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [error, setErrors] = useState({
        nomor_sim: "",
        general: ""
    });


    // Pencarian user dengan debounce
    useEffect(() => {
        const handleSearch = async () => {
            try {
                setIsSearching(true);
                const data = await searchUsers(searchQuery);
                setUsers(data); // Data sudah bertipe User[]
            } catch (err) {
                console.error("Gagal mencari user:", err);
                setUsers([]);
            } finally {
                setIsSearching(false);
            }
        };

        if (searchQuery.length >= 3) {
            const delayDebounce = setTimeout(handleSearch, 300);
            return () => clearTimeout(delayDebounce);
        } else {
            setUsers([]);
        }
    }, [searchQuery]);

    // Inisialisasi form saat edit
    useEffect(() => {
        const loadUserData = async () => {
            if (editingSim?.user_id) {
                try {
                    // Cari by user_id menggunakan fungsi searchUsers
                    const data = await searchUsers(editingSim.user_id.toString());
                    if (data.length > 0) {
                        setSearchQuery(data[0].nama_lengkap);
                    }
                } catch (err) {
                    console.error("Gagal memuat data user:", err);
                }
            }
        };

        if (editingSim) {
            setForm(editingSim);
            loadUserData();
        }
    }, [editingSim]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };



    // Perubahan pada fungsi handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setErrors({
            nomor_sim: "",
            general: ""
        });

        // Validasi user dipilih
        if (form.user_id === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Harap pilih pemilik SIM terlebih dahulu!',
            });
            return;
        }

        try {
            if (editingSim) {
                await updateSIM(form);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data SIM berhasil diperbarui',
                });
            } else {
                await createSIM(form);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data SIM baru berhasil ditambahkan',
                });
            }
            onSuccess();
        } catch (err: any) {
            console.error("Submit error:", err);

            // Handle duplicate error
            if (err.message.includes("Duplicate entry")) {
                const duplicateValue = err.message.match(/'([^']+)'/)?.[1] || '';
                setErrors({
                    general: "",
                    nomor_sim: `Nomor SIM ${duplicateValue} sudah terdaftar`
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: err.message || 'Terjadi kesalahan saat menyimpan data',
                });
            }
        }
    };

    // Hapus state error dan tampilan error
    // Hapus ini:
    // const [error, setError] = useState("");
    // Dan bagian JSX ini:
    // {error && (...)}

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingSim ? "✏️ Edit SIM" : "➕ Tambah SIM Baru"}
            </h2>


            {error.general && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 mb-4">
                    ⚠️ {error.general}
                </div>
            )}


            {/* Pencarian User */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Pemilik SIM <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama atau nomor telepon..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />

                    {isSearching && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {users.length > 0 && !isSearching && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {users.map(user => (
                                <div
                                    key={user.user_id}
                                    onClick={() => {
                                        setForm({ ...form, user_id: user.user_id });
                                        setSearchQuery(user.nama_lengkap);
                                        setUsers([]);
                                    }}
                                    className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                >
                                    <div className="font-medium text-gray-800">{user.nama_lengkap}</div>
                                    <div className="text-sm text-gray-600">{user.no_telepon}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {form.user_id !== 0 && (
                    <div className="text-sm text-green-600 mt-1">
                        ✅ Terpilih: {searchQuery}
                    </div>
                )}
            </div>

            {/* Form Input SIM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Di bagian input nomor SIM */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Nomor SIM <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="nomor_sim"
                        value={form.nomor_sim}
                        onChange={handleChange}
                        placeholder="12 digit angka"
                        required
                        pattern="[0-9]{12}"
                        className="w-full p-2 border rounded-md"
                    />
                    {error.nomor_sim && (
                        <p className="text-red-500 text-sm mt-1">{error.nomor_sim}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Jenis SIM <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="jenis_sim"
                        value={form.jenis_sim}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="A">SIM A (Mobil Penumpang)</option>
                        <option value="B">SIM B (Truk/Bus)</option>
                        <option value="C">SIM C (Motor)</option>
                        <option value="D">SIM D (Alat Berat)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tanggal Terbit <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="tanggal_terbit"
                        value={form.tanggal_terbit}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tanggal Expired <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="tanggal_expired"
                        value={form.tanggal_expired}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {editingSim && (
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700">
                            Status SIM
                        </label>
                        <select
                            name="status_sim"
                            value={form.status_sim}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                            <option value="Ditangguhkan">Ditangguhkan</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {editingSim ? "Perbarui SIM" : "Simpan Data"}
                </button>
            </div>
        </form>
    );
}