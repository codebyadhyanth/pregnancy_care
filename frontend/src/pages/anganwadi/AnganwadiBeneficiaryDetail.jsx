import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import BeneficiarySuggestionsTab from "./BeneficiarySuggestionsTab";

const AnganwadiBeneficiaryDetail = () => {
    const { momId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [activity, setActivity] = useState({});
    const [activeTab, setActiveTab] = useState("overview");
    const [activityLoading, setActivityLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [momId]);

    useEffect(() => {
        if (activeTab === "activity" || activeTab === "appointments") {
            fetchActivity();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`/api/anganwadi/beneficiaries/${momId}`);
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to load profile:", error);
            toast.error("Failed to load beneficiary profile");
            navigate("/anganwadi/beneficiaries");
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        setActivityLoading(true);
        try {
            const res = await axios.get(`/api/anganwadi/beneficiaries/${momId}/activity`);
            setActivity(res.data);
        } catch (error) {
            console.error("Failed to load activity:", error);
            toast.error("Failed to load activity data");
        } finally {
            setActivityLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/anganwadi/beneficiaries")}
                    className="mb-4 text-pink-600 hover:text-pink-700 flex items-center gap-2 font-medium"
                >
                    ← Back to Beneficiaries
                </button>

                {/* Header Card with Anganwadi Center ID */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                            <p className="text-teal-100 text-lg">Beneficiary Profile</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[200px]">
                            <p className="text-teal-100 text-sm mb-1">Anganwadi Center ID</p>
                            <p className="text-2xl font-bold font-mono">{profile.anganwadiCenter?.centerId || "N/A"}</p>
                            <p className="text-teal-100 text-xs mt-1">{profile.anganwadiCenter?.centerName || "Not Assigned"}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                        <p className="text-gray-500 text-sm mb-1">Pregnancy Week</p>
                        <p className="text-3xl font-bold text-blue-600">{profile.pregnancyWeek || "N/A"}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm mb-1">Total Visits</p>
                        <p className="text-3xl font-bold text-green-600">{profile.visitStats?.total || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
                        <p className="text-gray-500 text-sm mb-1">Completed</p>
                        <p className="text-3xl font-bold text-purple-600">{profile.visitStats?.completed || 0}</p>
                    </div>
                    <div className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${profile.riskLevel === "high" ? "border-red-500" :
                        profile.riskLevel === "medium" ? "border-yellow-500" :
                            "border-green-500"
                        }`}>
                        <p className="text-gray-500 text-sm mb-1">Risk Level</p>
                        <p className={`text-2xl font-bold ${profile.riskLevel === "high" ? "text-red-600" :
                            profile.riskLevel === "medium" ? "text-yellow-600" :
                                "text-green-600"
                            }`}>
                            {profile.riskLevel || "Normal"}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex flex-wrap">
                            {["overview", "activity", "suggestions", "appointments", "migration"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 min-w-[120px] px-6 py-4 text-sm font-semibold capitalize transition-all ${activeTab === tab
                                        ? "bg-white text-pink-600 border-b-3 border-pink-500 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-8">
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                {/* Contact Information Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">📞</span>
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Email</p>
                                            <p className="font-semibold text-gray-800">{profile.email || "Not provided"}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Phone</p>
                                            <p className="font-semibold text-gray-800">{profile.phone || "Not provided"}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">MCP ID</p>
                                            <p className="font-semibold text-gray-800 font-mono">{profile.mcpId || <span className="text-gray-400 italic">Not provided</span>}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">District</p>
                                            <p className="font-semibold text-gray-800">{profile.currentDistrict || profile.anganwadiCenter?.district || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Details Card */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">👤</span>
                                        Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Address</p>
                                            <p className="font-semibold text-gray-800">{profile.address || "Not provided"}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Permanent Address</p>
                                            <p className="font-semibold text-gray-800">{profile.permanentAddress || "Not provided"}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Husband's Name</p>
                                            <p className="font-semibold text-gray-800">{profile.husbandName || "Not provided"}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Father's Name</p>
                                            <p className="font-semibold text-gray-800">{profile.fatherName || "Not provided"}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Due Date</p>
                                            <p className="font-semibold text-gray-800">
                                                {profile.dueDate ? new Date(profile.dueDate).toLocaleDateString() : "Not set"}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-sm text-gray-500 mb-1">Jurisdiction</p>
                                            <p className="font-semibold text-gray-800">{profile.jurisdiction || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Visits */}
                                {profile.visitStats?.upcoming?.length > 0 && (
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">📅</span>
                                            Upcoming Visits
                                        </h3>
                                        <div className="space-y-3">
                                            {profile.visitStats.upcoming.map((visit) => (
                                                <div key={visit._id} className="bg-white rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{new Date(visit.nextVisitDate).toLocaleDateString()}</p>
                                                        <p className="text-sm text-gray-600">{visit.notes || "Routine checkup"}</p>
                                                    </div>
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Scheduled</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Activity Tab */}
                        {activeTab === "activity" && (
                            <div className="space-y-6">
                                {activityLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">Loading activity...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Nutrition Card */}
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-sm">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">🍎</span>
                                                Nutrition Logs
                                            </h3>
                                            {activity.nutrition?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {activity.nutrition.slice(0, 6).map((log) => (
                                                        <div key={log._id} className="bg-white rounded-lg p-4 shadow-sm">
                                                            <p className="font-semibold text-gray-800 mb-1">{new Date(log.date || log.createdAt).toLocaleDateString()}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {log.items?.length > 0
                                                                    ? log.items.map(item => item.name || item).join(", ")
                                                                    : log.foodEntry || "No details"}
                                                            </p>
                                                            {log.totals && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {log.totals.calories || 0} cal · {log.totals.protein || 0}g protein
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic bg-white rounded-lg p-4">No nutrition data yet</p>
                                            )}
                                        </div>

                                        {/* Health Tracking Card */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-sm">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">❤️</span>
                                                Health Tracking
                                            </h3>
                                            {activity.tracking?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {activity.tracking.slice(0, 6).map((track) => (
                                                        <div key={track._id} className="bg-white rounded-lg p-4 shadow-sm">
                                                            <p className="font-semibold text-gray-800 mb-2">{new Date(track.date || track.createdAt).toLocaleDateString()}</p>
                                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                                {track.motherWeight && <p>Weight: <span className="font-semibold">{track.motherWeight} kg</span></p>}
                                                                {track.steps > 0 && <p>Steps: <span className="font-semibold">{track.steps}</span></p>}
                                                                {track.waterIntakeLiters > 0 && <p>Water: <span className="font-semibold">{track.waterIntakeLiters}L</span></p>}
                                                                {track.distanceKm > 0 && <p>Distance: <span className="font-semibold">{track.distanceKm} km</span></p>}
                                                                {track.symptoms?.length > 0 && <p className="col-span-2">Symptoms: <span className="font-semibold">{Array.isArray(track.symptoms) ? track.symptoms.join(', ') : track.symptoms}</span></p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic bg-white rounded-lg p-4">No tracking data yet</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === "appointments" && (
                            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">📋</span>
                                    Appointment History
                                </h3>
                                {activity.visits?.length > 0 ? (
                                    <div className="space-y-3">
                                        {activity.visits.map((visit) => (
                                            <div key={visit._id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-gray-800 text-lg">{new Date(visit.nextVisitDate).toLocaleDateString()}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{visit.notes || "No notes"}</p>
                                                    <p className="text-xs text-gray-500 mt-1">📍 {visit.anganwadi?.centerName}</p>
                                                </div>
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${visit.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {visit.completed ? "✓ Completed" : "⏳ Scheduled"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic bg-white rounded-lg p-4">No appointments yet</p>
                                )}
                            </div>
                        )}

                        {/* Suggestions Tab */}
                        {activeTab === "suggestions" && (
                            <BeneficiarySuggestionsTab momId={momId} />
                        )}

                        {/* Migration Tab */}
                        {activeTab === "migration" && (
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8 shadow-sm text-center">
                                <div className="max-w-md mx-auto">
                                    <span className="bg-yellow-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🚚</span>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Migration Management</h3>
                                    <p className="text-gray-700 mb-6">
                                        Migration features (Release/Claim) are available in the main Migration page.
                                    </p>
                                    <button
                                        onClick={() => navigate("/anganwadi/migration")}
                                        className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Go to Migration Page →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnganwadiBeneficiaryDetail;
