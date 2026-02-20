import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, AlertTriangle, Calendar, Activity, Plus, Building2, Copy } from "lucide-react";
import toast from "react-hot-toast";

const StatCard = ({ label, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full bg-${color}-50`}>
                <Icon className={`w-6 h-6 text-${color}-600`} style={{ color: color }} />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metric</span>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            {subtext && <p className="text-xs text-green-600 mt-2 font-medium">{subtext}</p>}
        </div>
    </div>
);

const AnganwadiDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalMoms: 0,
        highRiskCases: 0,
        dueThisMonth: 0,
        recentRegistrations: 0
    });
    const [centerProfile, setCenterProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get("/api/anganwadi/dashboard-stats", {
                withCredentials: true
            });
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get("/api/anganwadi/profile", {
                withCredentials: true
            });
            setCenterProfile(data);
        } catch (error) {
            console.error("Failed to fetch center profile");
        }
    };

    useEffect(() => {
        fetchStats();
        fetchProfile();
    }, []);

    const copyCenterId = () => {
        if (centerProfile?.anganwadiCenterId) {
            navigator.clipboard.writeText(centerProfile.anganwadiCenterId);
            toast.success("Centre ID copied!");
        }
    };

    return (
        <div className="space-y-8">
            {/* Centre Info Banner */}
            {centerProfile && (
                <div className="bg-gradient-to-r from-[#2E7D6B] to-[#3DA68D] rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{centerProfile.centerName}</h1>
                                <p className="text-teal-100 text-sm mt-0.5">
                                    {centerProfile.district}, {centerProfile.state}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                                <p className="text-xs text-teal-100 uppercase tracking-wider font-semibold">Centre ID</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl font-mono font-bold tracking-wide">
                                        {centerProfile.anganwadiCenterId}
                                    </span>
                                    <button onClick={copyCenterId} className="p-1 hover:bg-white/20 rounded transition-colors">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="text-gray-500">Here's what's happening today.</p>
                </div>
                <button
                    onClick={() => navigate('/anganwadi/beneficiaries')}
                    className="bg-[#2E7D6B] hover:bg-[#256657] text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Link New Mother
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Registered Mothers"
                    value={stats.totalMoms}
                    icon={Users}
                    color="#2E7D6B"
                />
                <StatCard
                    label="High Risk Cases"
                    value={stats.highRiskCases}
                    icon={AlertTriangle}
                    color="#DC2626"
                    subtext="Requires immediate attention"
                />
                <StatCard
                    label="Due This Month"
                    value={stats.dueThisMonth}
                    icon={Calendar}
                    color="#D97706"
                />
                <StatCard
                    label="Recent Registrations"
                    value={stats.recentRegistrations}
                    icon={Activity}
                    color="#2563EB"
                />
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-6">Recent Alerts</h3>
                    <div className="space-y-4">
                        {stats.highRiskCases > 0 ? (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-700 text-sm">High Risk Beneficiaries Detected</h4>
                                    <p className="text-red-600 text-xs mt-1">
                                        You have {stats.highRiskCases} mothers flagged with health risks. Please review the Beneficiaries tab.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No active alerts at this time.</p>
                        )}

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-blue-700 text-sm">System Update</h4>
                                <p className="text-blue-600 text-xs mt-1">
                                    Migration portal is now active. You can release/claim mothers from other districts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-6">Quick Links</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/anganwadi/visits')}
                            className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-[#E8F5F3] hover:text-[#2E7D6B] transition-colors text-sm font-medium border border-transparent hover:border-[#2E7D6B]"
                        >
                            Schedule Visit
                        </button>
                        <button
                            onClick={() => navigate('/anganwadi/generate-id')}
                            className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-[#E8F5F3] hover:text-[#2E7D6B] transition-colors text-sm font-medium border border-transparent hover:border-[#2E7D6B]"
                        >
                            Generate Mom ID
                        </button>
                        <button
                            onClick={() => navigate('/anganwadi/reports')}
                            className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-[#E8F5F3] hover:text-[#2E7D6B] transition-colors text-sm font-medium border border-transparent hover:border-[#2E7D6B]"
                        >
                            View Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnganwadiDashboard;
