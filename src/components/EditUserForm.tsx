import React, { useState } from 'react';
import { User } from '../services/api';

interface EditUserFormProps {
    user: User;
    onUpdateUser: (updatedUser: User) => void;
    onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onUpdateUser, onCancel }) => {
    const [updatedUser, setUpdatedUser] = useState<User>({
        ...user,
        password: '',
        alamat: user.alamat || '', // Default value jika alamat null
        no_telepon: user.no_telepon || ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser(updatedUser);
    };


    return (
        <div className="p-4 border rounded-md bg-white shadow-md mb-4">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Edit Pengguna</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                    <label className="block font-medium">Nama Lengkap</label>
                    <input type="text"
                        name="nama_lengkap"
                        value={updatedUser.nama_lengkap}
                        onChange={handleChange}
                        className="p-2 border rounded-md w-full"
                        placeholder='Masukkan nama lengkap'
                    />
                </div>

                <div className="mb-2">
                    <label className="block font-medium">Email</label>
                    <input type="text"
                        name="email"
                        value={updatedUser.email}
                        onChange={handleChange}
                        className="p-2 border rounded-md w-full"
                        placeholder='projectyai.com@gmail.com'
                    />
                </div>
                <div className="mb-2">
                    <label className="block font-medium">Nomor Telepon</label>
                    <input
                        type="text"
                        name="no_telepon"
                        value={updatedUser.no_telepon}
                        onChange={handleChange}
                        className="p-2 border rounded-md w-full"
                        placeholder='Masukkan nomor telepon'
                    />
                </div>

                <div className="mb-2">
                    <label className="block font-medium">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={updatedUser.password || ''}
                        onChange={handleChange}
                        className="p-2 border rounded-md w-full"
                        placeholder='Masukkan password baru'
                    />
                </div>


                <div className="mb-2">

                    <label className="block font-medium">Alamat</label>
                    <textarea
                        name="alamat"
                        onChange={handleTextareaChange}
                        value={updatedUser.alamat}
                        className="p-2 border rounded-md w-full"
                        placeholder='Alamat Anda'
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                        Simpan
                    </button>

                    <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-blue-500">
                        Batal
                    </button>
                </div>


            </form>
        </div >
    );
};

export default EditUserForm;