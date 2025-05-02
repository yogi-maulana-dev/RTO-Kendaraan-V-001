import { useState, useEffect, useRef } from "react";
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

interface FormErrors {
    nomor_sim: string;
    tanggal_terbit: string;
    tanggal_expired: string;
    user_id: string;
    general: string;
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
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const nomorSimRef = useRef<HTMLInputElement>(null);
    const userSearchRef = useRef<HTMLInputElement>(null);


    const [errors, setErrors] = useState<FormErrors>({
        nomor_sim: "",
        tanggal_terbit: "",
        tanggal_expired: "",
        user_id: "",
        general: ""
    });

    // Pencarian user dengan debounce
    useEffect(() => {
        const handleSearch = async () => {
            try {
                setIsSearching(true);
                const data = await searchUsers(searchQuery);
                setUsers(data);
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
        } else if (user_id !== 0) {
            // Jika ada user_id default, load data user tersebut
            loadDefaultUser();
        }
    }, [editingSim, user_id]);

    const loadDefaultUser = async () => {
        if (user_id) {
            try {
                const data = await searchUsers(user_id.toString());
                if (data.length > 0) {
                    setSearchQuery(data[0].nama_lengkap);
                }
            } catch (err) {
                console.error("Gagal memuat data user default:", err);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Validasi real-time setelah user mulai mengetik
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        validateField(name, value);
    };

    const validateField = (name: string, value: string) => {
        let newErrors = { ...errors };

        switch (name) {
            case "nomor_sim":
                if (!value) {
                    newErrors.nomor_sim = "Nomor SIM tidak boleh kosong";
                } else if (!/^\d{12}$/.test(value)) {
                    newErrors.nomor_sim = "Nomor SIM harus 12 digit angka";
                } else {
                    newErrors.nomor_sim = "";
                }
                break;

            case "tanggal_terbit":
                if (!value) {
                    newErrors.tanggal_terbit = "Tanggal terbit tidak boleh kosong";
                } else if (new Date(value) > new Date()) {
                    newErrors.tanggal_terbit = "Tanggal terbit tidak boleh di masa depan";
                } else {
                    newErrors.tanggal_terbit = "";

                    // Validasi silang dengan tanggal expired
                    if (form.tanggal_expired && new Date(value) >= new Date(form.tanggal_expired)) {
                        newErrors.tanggal_expired = "Tanggal expired harus setelah tanggal terbit";
                    } else {
                        newErrors.tanggal_expired = "";
                    }
                }
                break;

            case "tanggal_expired":
                if (!value) {
                    newErrors.tanggal_expired = "Tanggal expired tidak boleh kosong";
                } else if (form.tanggal_terbit && new Date(value) <= new Date(form.tanggal_terbit)) {
                    newErrors.tanggal_expired = "Tanggal expired harus setelah tanggal terbit";
                } else {
                    newErrors.tanggal_expired = "";
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return !newErrors[name as keyof FormErrors];
    };

    const validateForm = (): boolean => {
        // Mark all fields as touched
        const allTouched = {
            nomor_sim: true,
            tanggal_terbit: true,
            tanggal_expired: true,
            user_id: true
        };
        setTouched(allTouched);

        // Validate each field
        let formErrors: FormErrors = {
            nomor_sim: "",
            tanggal_terbit: "",
            tanggal_expired: "",
            user_id: "",
            general: ""
        };

        // Validasi user_id
        if (!form.user_id) {
            formErrors.user_id = "Pemilik SIM harus dipilih";
        }

        // Validasi nomor_sim
        if (!form.nomor_sim) {
            formErrors.nomor_sim = "Nomor SIM tidak boleh kosong";
        } else if (!/^\d{12}$/.test(form.nomor_sim)) {
            formErrors.nomor_sim = "Nomor SIM harus 12 digit angka";
        }

        // Validasi tanggal terbit
        if (!form.tanggal_terbit) {
            formErrors.tanggal_terbit = "Tanggal terbit tidak boleh kosong";
        } else if (new Date(form.tanggal_terbit) > new Date()) {
            formErrors.tanggal_terbit = "Tanggal terbit tidak boleh di masa depan";
        }

        // Validasi tanggal expired
        if (!form.tanggal_expired) {
            formErrors.tanggal_expired = "Tanggal expired tidak boleh kosong";
        } else if (form.tanggal_terbit && new Date(form.tanggal_expired) <= new Date(form.tanggal_terbit)) {
            formErrors.tanggal_expired = "Tanggal expired harus setelah tanggal terbit";
        }

        setErrors(formErrors);

        // Cek apakah ada error
        return !Object.values(formErrors).some(error => error !== "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset general error
        setErrors({ ...errors, general: "" });

        // Validasi form
        if (!validateForm()) {
            // Fokus ke field pertama yang error
            if (errors.user_id && userSearchRef.current) {
                userSearchRef.current.focus();
            } else if (errors.nomor_sim && nomorSimRef.current) {
                nomorSimRef.current.focus();
            }
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
        }
        catch (err: any) {
            console.error("Submit error:", err);
            if (err.message.includes("Duplicate entry")) {
                const duplicateValue = err.message.match(/'([^']+)'/)?.[1] || '';
                setErrors({
                    ...errors,
                    nomor_sim: `Nomor SIM ${duplicateValue} sudah terdaftar`,
                    general: ""
                });

                // Fokuskan ke input nomor SIM
                if (nomorSimRef.current) {
                    nomorSimRef.current.focus();
                    nomorSimRef.current.select();
                }
            } else {
                setErrors({
                    ...errors,
                    general: err.message || 'Terjadi kesalahan saat menyimpan data'
                });
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: err.message || 'Terjadi kesalahan saat menyimpan data',
                });
            }
        }
    };

    // Helper function untuk render field error
    const renderError = (errorMessage: string) => {
        if (!errorMessage) return null;

        return (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
            </p>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingSim ? "✏️ Edit SIM" : "➕ Tambah SIM Baru"}
            </h2>

            {errors.general && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 mb-4">
                    ⚠️ {errors.general}
                </div>
            )}

            {/* Pencarian User */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Pemilik SIM <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        ref={userSearchRef}
                        type="text"
                        placeholder="Cari berdasarkan nama atau nomor telepon..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => setTouched({ ...touched, user_id: true })}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${touched.user_id && errors.user_id ? 'border-red-500' : ''}`}
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
                                        // Clear user_id error
                                        setErrors({ ...errors, user_id: "" });
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

                {touched.user_id && renderError(errors.user_id)}

                {searchQuery.length > 0 && searchQuery.length < 3 && (
                    <p className="text-sm text-gray-500 mt-1">
                        Ketik minimal 3 karakter untuk mencari
                    </p>
                )}

                {/* {searchQuery.length >= 3 && users.length === 0 && !isSearching && (
                    <p className="text-sm text-orange-500 mt-1">
                        Pengguna tidak ditemukan
                    </p>
                )} */}
            </div>

            {/* Form Input SIM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Nomor SIM */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Nomor SIM <span className="text-red-500">*</span>
                    </label>
                    <input
                        ref={nomorSimRef}
                        name="nomor_sim"
                        value={form.nomor_sim}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="12 digit angka"
                        required
                        className={`w-full p-2 border rounded-md 
                            ${touched.nomor_sim ?
                                errors.nomor_sim ? 'border-red-500 focus:ring-red-400 focus:border-red-400' :
                                    'border-green-500 focus:ring-green-400 focus:border-green-400' : ''}`}
                    />
                    {touched.nomor_sim && (
                        errors.nomor_sim ?
                            renderError(errors.nomor_sim) :
                            <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Format nomor SIM valid
                            </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Nomor SIM terdiri dari 12 digit angka
                    </p>
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
                        onBlur={handleBlur}
                        required
                        className={`w-full p-2 border rounded-md 
                            ${touched.tanggal_terbit ?
                                errors.tanggal_terbit ? 'border-red-500 focus:ring-red-400 focus:border-red-400' :
                                    'border-green-500 focus:ring-green-400 focus:border-green-400' : ''}`}
                    />
                    {touched.tanggal_terbit && renderError(errors.tanggal_terbit)}
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
                        onBlur={handleBlur}
                        required
                        className={`w-full p-2 border rounded-md 
                            ${touched.tanggal_expired ?
                                errors.tanggal_expired ? 'border-red-500 focus:ring-red-400 focus:border-red-400' :
                                    'border-green-500 focus:ring-green-400 focus:border-green-400' : ''}`}
                    />
                    {touched.tanggal_expired && renderError(errors.tanggal_expired)}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={Object.values(errors).some(error => error !== "")}
                >
                    {editingSim ? "Perbarui SIM" : "Simpan Data"}
                </button>
            </div>
        </form>
    );
}