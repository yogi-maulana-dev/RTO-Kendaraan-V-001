// pages/SIMManagement.tsx
import { useState, useEffect } from "react";
import { SIMData, getSIMs, deleteSIM } from "../../services/api";
import SIMForm from "../SIM/SIMForm";
import SIMTable from "../SIM/SIMTable";

export default function SIMManagement() {
    const [sims, setSims] = useState<SIMData[]>([]);
    const [filteredSims, setFilteredSims] = useState<SIMData[]>([]);
    const [selectedSim, setSelectedSim] = useState<SIMData | undefined>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [search, setSearch] = useState("");

    const loadSIMs = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getSIMs();
            console.log('Data loaded:', data); // Debugging
            setSims(data);
            setFilteredSims(data);
        } catch (err) {
            console.error('Load error:', err);
            setError(err instanceof Error ? err.message : "Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sim_id: number) => {
        if (!window.confirm("Yakin ingin menghapus SIM ini?")) return;

        try {
            await deleteSIM(sim_id);
            await loadSIMs();
            alert("SIM berhasil dihapus");
        } catch (err) {
            console.error('Delete error:', err);
            alert(err instanceof Error ? err.message : "Gagal menghapus");
        }
    };

    useEffect(() => {
        const results = sims.filter(sim =>
            sim.nomor_sim.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredSims(results);
    }, [search, sims]);

    useEffect(() => {
        loadSIMs();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Manajemen SIM</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`px-6 py-2 rounded-lg transition-colors ${showAddForm
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                >
                    {showAddForm ? "✖ Tutup Form" : "➕ Tambah Baru"}
                </button>

                <input
                    type="text"
                    placeholder="🔍 Cari berdasarkan nomor SIM..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {showAddForm && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
                    <SIMForm
                        editingSim={selectedSim}
                        onSuccess={() => {
                            setShowAddForm(false);
                            setSelectedSim(undefined);
                            loadSIMs();
                        }}
                    />
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
            ) : (
                <SIMTable
                    sims={filteredSims}
                    onEdit={(sim) => {
                        setSelectedSim(sim);
                        setShowAddForm(true);
                    }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}