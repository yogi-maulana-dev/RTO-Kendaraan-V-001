import { useEffect, useState } from 'react';
import { getUsers, User } from "./services/api";
import './App.css';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers();
      setUsers(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="container mx-auto max-w-7xl p-4 md:p-6 mt-8">
        <h2 className="text-2xl font-bold md-4 text-blue-600">Daftar Pengguna</h2>

        {users.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="overflow-x-auto rounded-lg shadow-md">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Alamat</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Nomor Telpon</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (

                  <tr key={user.user_id}
                    className={`${index % 2 === 0 ? "bg-fray-50" : "bg-white"}
                      hover:bg-blue-50 transition-colors
                      `}>

                    <td className="px-6 py-6 text-sm text-gray-700">{user.user_id}</td>
                    <td className="px-6 py-6 text-sm text-gray-700">{user.nama_lengkap}</td>
                    <td className="px-6 py-6 text-sm text-gray-700">{user.alamat}</td>
                    <td className="px-6 py-6 text-sm text-gray-700">{user.no_telepon}</td>
                    <td className="px-6 py-6 text-sm">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
                        Edit
                      </button>

                      <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
                        Hapus
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Tidak ada pengguna</p>
        )}



      </div>
    </div>
  );

};

export default App
