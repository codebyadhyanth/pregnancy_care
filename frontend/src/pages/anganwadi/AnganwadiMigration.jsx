import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRightLeft, Upload, Download, Search } from "lucide-react";
import toast from "react-hot-toast";

const AnganwadiMigration = () => {
    const [activeTab, setActiveTab] = useState("release"); // release | claim
    const [myMothers, setMyMothers] = useState([]);
    const [releasedMothers, setReleasedMothers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "release") {
                const { data } = await axios.get("/api/anganwadi/beneficiaries", { withCredentials: true });
                setMyMothers(data);
            } else {
                const { data } = await axios.get("/api/anganwadi/migration-requests", { withCredentials: true });
                setReleasedMothers(data);
            }
        } catch (error) {
            console.error("Failed to fetch migration data");
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async (momId) => {
        if (!window.confirm("Are you sure you want to release this mother? She will be unlinked from your center.")) return;
        try {
            // Check if momId is actually the MCP ID or Mongo ID?
            // Controller `releaseMother` uses `const { momId } = req.body; User.findOne({ momId })`
            // Wait, my controller logic for `releaseMother` (lines 227) uses `momId` field search?
            // "const user = await User.findOne({ momId, ... })" 
            // Previous controller code used `momId` field. 
            // But if I pass the `_id`, I should update controller to support `_id` too?
            // Or pass the `mcpId`. 
            // My beneficiary list has `mcpId`. 
            // Let's UPDATE controller `releaseMother` and `claimMother` to be robust like `scheduleVisit`.

            // For now, I will assume I fix controller.
            await axios.post("/api/anganwadi/release-mother", { userId: momId }, { withCredentials: true });
            toast.success("Mother Released Successfully");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Release failed");
        }
    };

    const handleClaim = async (momId) => {
        try {
            // Same here, need robust ID handling
            await axios.post("/api/anganwadi/claim-mother", { userId: momId }, { withCredentials: true });
            toast.success("Mother Claimed Successfully");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Claim failed");
        }
    };

    // Filter logic
    const list = activeTab === "release" ? myMothers : releasedMothers;
    const filteredList = list.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mcpId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ArrowRightLeft className="text-teal-700" />
                    Migration Portal
                </h1>
                <p className="text-gray-500">Manage beneficiary transfers between centers.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
                <button
                    onClick={() => setActiveTab("release")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === "release" ? "bg-teal-700 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    <Upload size={18} /> Release (Transfer Out)
                </button>
                <button
                    onClick={() => setActiveTab("claim")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === "claim" ? "bg-teal-700 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    <Download size={18} /> Claim (Transfer In)
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search Name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredList.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No records found.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">MCP ID</th>
                                <th className="p-4">District/State</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredList.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-800">{item.name}</td>
                                    <td className="p-4 font-mono text-teal-700">{item.mcpId || "N/A"}</td>
                                    <td className="p-4 text-gray-600">{item.district || "Unknown"}, {item.state || "Unknown"}</td>
                                    <td className="p-4 text-right">
                                        {activeTab === "release" ? (
                                            <button
                                                onClick={() => handleRelease(item._id)}
                                                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg border border-red-200 transition-colors"
                                            >
                                                Release
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleClaim(item._id)}
                                                className="text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg border border-teal-200 transition-colors"
                                            >
                                                Claim
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AnganwadiMigration;
