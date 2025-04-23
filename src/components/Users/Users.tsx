import React, { useEffect, useState } from "react";
import { getUsers, User, deleteUser, updateUser } from "../../services/api";
import Swal from "sweetalert2";
import AddUserForm from "../TambahUserForm";
import EditUserForm from "../EditUserForm";

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const usersPerPage = 5;

    const fetchData = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredUsers(
            users.filter((user) =>
                [user.nama_lengkap, user.no_telepon].some(value =>
                    typeof value === "string" && value.toLowerCase().includes(search.toLowerCase())
                )
            )
        );
    }, [search, users]);

    const handleDeleteUser = async (user_id: number) => {
        const confirmation = await Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data ini akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (!confirmation.isConfirmed) return;

        const result = await deleteUser(user_id);
        if (result.success) {
            await Swal.fire("Sukses", "Data berhasil dihapus!", "success");
            fetchData();
        } else {
            Swal.fire("Gagal", result.message || "Terjadi kesalahan!", "error");
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    const handleUpdateUser = async (updatedUser: User) => {
        const result = await updateUser(updatedUser);
        if (result.success) {
            await Swal.fire("Sukses", "Data berhasil diperbarui!", "success");
            setEditingUser(null);
            fetchData();
        } else {
            Swal.fire("Gagal", result.message || "Terjadi kesalahan!", "error");
        }
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="container mx-auto max-w-7xl p-4 md:p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-500 text-white px-4 py-2 rounded-md">
                    {showAddForm ? "Tutup Form" : "Tambah Data"}
                </button>
                <input
                    type="text"
                    placeholder="Cari nama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border rounded-md w-full md:w-64"
                />
            </div>

            {showAddForm && <AddUserForm onUserAdded={() => { fetchData(); setShowAddForm(false); }} />}

            {editingUser && (
                <EditUserForm user={editingUser} onUpdateUser={handleUpdateUser} onCancel={() => setEditingUser(null)} />
            )}

            <h2 className="text-2xl font-bold mb-4 text-blue-600">Daftar Pengguna</h2>
            {loading ? (
                <p className="text-gray-600">Memuat data...</p>
            ) : currentUsers.length > 0 ? (
                <>
                    <table className="min-w-full bg-white">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Nama</th>
                                <th className="px-6 py-3">Alamat</th>
                                <th className="px-6 py-3">No. HP</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.user_id} className="border-t">
                                    <td className="px-6 py-4">{user.user_id}</td>
                                    <td className="px-6 py-4">{user.nama_lengkap}</td>
                                    <td className="px-6 py-4">{user.alamat}</td>
                                    <td className="px-6 py-4">{user.no_telepon}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEditUser(user)} className="bg-blue-500 text-white px-3 py-1 rounded-md">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.user_id!)} className="bg-red-500 text-white px-3 py-1 rounded-md ml-2">
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-gray-300 px-3 py-1 rounded-md mx-2"
                        >
                            Prev
                        </button>
                        <span>Halaman {currentPage} dari {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="bg-gray-300 px-3 py-1 rounded-md mx-2"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>Tidak ada data tersedia.</p>
            )}
        </div>
    );
};

export default Users;
