import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter, Eye, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AnganwadiBeneficiaries = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("All");

    useEffect(() => {
        fetchBeneficiaries();
    }, [searchTerm]); // Debounce in real app, simple effect for now

    const fetchBeneficiaries = async () => {
        try {
            // Controller supports ?search=..
            const { data } = await axios.get(`/api/anganwadi/beneficiaries?search=${searchTerm}`, {
                withCredentials: true
            });
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load beneficiaries");
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (filterRisk === "All") return true;
        if (filterRisk === "High Risk") return user.highRiskStatus === "High Risk";
        return true;
    });

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
                    <p className="text-gray-500">Manage all registered mothers under your center.</p>
                </div>
                <Link to="/anganwadi/generate-id" className="bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-teal-800 transition-colors">
                    + New Registration
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Name or MCP ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                    >
                        <option value="All">All Risk Categories</option>
                        <option value="High Risk">High Risk Only</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-8 text-gray-500">Loading beneficiaries...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No beneficiaries found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-4">MCP ID</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4">Trimester</th>
                                    <th className="p-4">Risk Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user._id}
                                        onClick={() => navigate(`/anganwadi/beneficiaries/${user._id}`)}
                                        className="hover:bg-pink-50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4 font-mono font-medium text-teal-700">
                                            {user.mcpId || <span className="text-gray-400 italic">Not provided</span>}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">{user.name}</td>
                                        <td className="p-4 text-gray-600">{user.motherPhone}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                {user.trimester || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.highRiskStatus === "High Risk" ? (
                                                <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1">
                                                    High Risk
                                                </span>
                                            ) : (
                                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/anganwadi/beneficiaries/${user._id}`);
                                                }}
                                                className="text-pink-600 hover:text-pink-700 transition-colors font-medium"
                                                title="View Details"
                                            >
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnganwadiBeneficiaries;
