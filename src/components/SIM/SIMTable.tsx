// components/SIMTable/SIMTable.tsx
import { SIMData } from "../../services/api";

interface Props {
    sims: SIMData[];
    onEdit: (sim: SIMData) => void;
    onDelete: (sim_id: number) => void;
}

export default function SIMTable({ sims, onEdit, onDelete }: Props) {
    if (!sims.length) {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                Tidak ada data SIM yang tersedia
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {["No. SIM", "Jenis", "Terbit", "Expired", "Status", "Aksi"].map(
                            (header) => (
                                <th
                                    key={header}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sims.map((sim) => (
                        <tr key={sim.sim_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-gray-900">
                                    {sim.nomor_sim}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    SIM {sim.jenis_sim}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(sim.tanggal_terbit).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(sim.tanggal_expired).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sim.status_sim === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {sim.status_sim}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button
                                    onClick={() => onEdit(sim)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => onDelete(sim.sim_id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    🗑️ Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}