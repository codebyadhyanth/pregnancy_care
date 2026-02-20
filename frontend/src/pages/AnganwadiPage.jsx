import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Building2, Calendar, MapPin, Phone, Mail, AlertCircle, CheckCircle, Check, Activity } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { toast } from 'react-hot-toast';

const AnganwadiPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("visits");

    // Unlinked State
    const [nearbyCenters, setNearbyCenters] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchMcpData();
    }, []);

    const fetchMcpData = async () => {
        try {
            const { data } = await api.get('/mcp/me');
            setData(data);
        } catch (error) {
            // If 404/403, it might mean not linked or not found.
            // We'll handle null data as "Not Linked"
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const { data } = await api.get(`/anganwadi/nearby?search=${searchQuery}`);
            setNearbyCenters(data);
        } catch (error) {
            toast.error("Failed to search centers");
        } finally {
            setSearching(false);
        }
    };

    const handleJoinRequest = async (centerId) => {
        try {
            await api.post("/anganwadi/join-request", { centerId });
            toast.success("Request sent! Waiting for approval.");
            // Optionally refresh nearby centers to show "Requested" status if we were tracking it locally
        } catch (error) {
            toast.error(error.response?.data?.message || "Request failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Anganwadi details...</div>;

    // Unlinked View
    if (!data?.linkedAnganwadi) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900">Find Your Anganwadi</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Link your profile to a local center to access visits, medicines, and nutrition benefits.
                    </p>
                </div>

                <GlassCard className="p-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by District or Center Name..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {nearbyCenters.length > 0 && (
                        <div className="mt-8 space-y-4">
                            {nearbyCenters.map(center => (
                                <div key={center._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{center.centerName}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {center.district}, {center.state}</span>
                                            {center.contactNumber && <span className="flex items-center gap-1"><Phone size={14} /> {center.contactNumber}</span>}
                                        </div>
                                        {/* Facilities Tags */}
                                        {center.facilities && center.facilities.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {center.facilities.slice(0, 3).map(f => (
                                                    <span key={f} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{f}</span>
                                                ))}
                                                {center.facilities.length > 3 && <span className="text-xs text-gray-400">+{center.facilities.length - 3} more</span>}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleJoinRequest(center._id)}
                                        className="bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                                    >
                                        Request to Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {nearbyCenters.length === 0 && !searching && (
                        <div className="text-center py-12 text-gray-400">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Search for your nearest Anganwadi center to begin.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        );
    }

    const { linkedAnganwadi, mcpId } = data.user;
    const visits = data.visits || [];

    const handleCompleteVisit = async (visitId) => {
        try {
            await api.patch('/mcp/visit-complete', { visitId });
            toast.success("Visit marked as completed!");
            fetchMcpData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Anganwadi</h1>
                    <p className="text-gray-500">Government Health Services & Benefit Tracking</p>
                </div>
            </div>

            {/* Linked Center Card */}
            <div className="bg-gradient-to-br from-[#2E7D6B] to-[#1F5448] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <Building2 size={250} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-white/10">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            MCP ID: {mcpId || "Pending Generation"}
                        </div>
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">{linkedAnganwadi.centerName}</h2>
                        <div className="flex flex-col gap-2 text-teal-50 text-sm">
                            <span className="flex items-center gap-2"><MapPin size={16} /> {linkedAnganwadi.address || 'Address not updated'}, {linkedAnganwadi.district}</span>
                            <span className="flex items-center gap-2"><Phone size={16} /> {linkedAnganwadi.contactNumber || 'No Contact Info'}</span>
                        </div>
                    </div>

                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 text-center min-w-[140px]">
                        <p className="text-xs text-teal-200 uppercase tracking-wider mb-1">Center Code</p>
                        <p className="text-xl font-mono font-bold tracking-widest">{linkedAnganwadi.anganwadiCenterId}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {["visits", "medications", "guidance", "facilities"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === tab ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        {tab === "medications" ? "Meds & Supply" : tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === "visits" && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Upcoming Visits */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Calendar className="text-teal-600" /> Upcoming Schedule
                        </h3>

                        {visits.length === 0 ? (
                            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No upcoming visits scheduled.</p>
                        ) : (
                            <div className="space-y-4">
                                {visits.map((visit) => (
                                    <div key={visit._id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${visit.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-teal-100 hover:border-teal-200'}`}>
                                        <div className="bg-teal-50 text-teal-700 p-3 rounded-lg text-center min-w-[70px]">
                                            <span className="block text-xs font-bold uppercase tracking-wider opacity-70">
                                                {new Date(visit.nextVisitDate).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="block text-2xl font-bold loading-none">
                                                {new Date(visit.nextVisitDate).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{visit.type ? visit.type.charAt(0).toUpperCase() + visit.type.slice(1) : "Regular"} Checkup</h4>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{visit.notes || "Routine health assessment and vaccination check."}</p>

                                            {visit.completed ? (
                                                <span className="text-xs flex items-center gap-1 text-green-600 mt-3 font-bold bg-green-50 w-fit px-2 py-1 rounded">
                                                    <CheckCircle size={12} /> COMPLETED
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleCompleteVisit(visit._id)}
                                                    className="text-xs bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-full mt-3 transition-colors font-medium"
                                                >
                                                    Mark as Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {/* Quick Stats or Info */}
                    <GlassCard className="p-6 bg-gradient-to-br from-teal-50 to-white">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Progress</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-teal-100">
                                <span className="text-gray-600">Total Visits Done</span>
                                <span className="font-bold text-xl text-teal-700">{visits.filter(v => v.completed).length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-teal-100">
                                <span className="text-gray-600">Pending Visits</span>
                                <span className="font-bold text-xl text-orange-500">{visits.filter(v => !v.completed).length}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === "medications" && (
                <div className="grid md:grid-cols-2 gap-8">
                    <GlassCard className="p-6 bg-gradient-to-br from-orange-50 to-white">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="text-orange-500" /> Center Supply Notices
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-700 bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                                <span>Iron Folic Acid tablets are in stock. Please collect during your next visit.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700 bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                                <span>Take Home Ration (THR) distribution scheduled for the 25th of this month.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700 bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0" />
                                <span>Calcium supplements available for 2nd & 3rd Trimester mothers.</span>
                            </li>
                        </ul>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Prescribed Supplementation</h3>
                        <div className="space-y-4">
                            <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-bold">Fe</div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Iron Folic Acid</h4>
                                    <p className="text-xs text-gray-500">1 Tablet Daily (Post Meal)</p>
                                </div>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold">Ca</div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Calcium Carbonate</h4>
                                    <p className="text-xs text-gray-500">2 Tablets Daily (After Lunch)</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 text-center">Consult your Anganwadi worker before changing dosage.</p>
                    </GlassCard>
                </div>
            )}

            {activeTab === "guidance" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Center Guidance & Announcements</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Updates from {linkedAnganwadi.centerName}</span>
                    </div>

                    <GuidanceList />
                </div>
            )}

            {activeTab === "facilities" && (
                <div className="space-y-6">
                    <GlassCard className="p-8">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Facilities */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Building2 className="text-teal-600" /> Facilities Available
                                </h3>
                                {linkedAnganwadi.facilities && linkedAnganwadi.facilities.length > 0 ? (
                                    <ul className="space-y-3">
                                        {linkedAnganwadi.facilities.map((facility, index) => (
                                            <li key={index} className="flex items-center gap-3 text-gray-700">
                                                <div className="bg-teal-50 p-1.5 rounded-full text-teal-600">
                                                    <Check size={14} />
                                                </div>
                                                {facility}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No specific facilities listed.</p>
                                )}
                            </div>

                            {/* Services */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Activity className="text-blue-600" /> Services Offered
                                </h3>
                                {linkedAnganwadi.services && linkedAnganwadi.services.length > 0 ? (
                                    <ul className="space-y-3">
                                        {linkedAnganwadi.services.map((service, index) => (
                                            <li key={index} className="flex items-center gap-3 text-gray-700">
                                                <div className="bg-blue-50 p-1.5 rounded-full text-blue-600">
                                                    <Check size={14} />
                                                </div>
                                                {service}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No specific services listed.</p>
                                )}
                            </div>
                        </div>

                        {/* Additional Info Block */}
                        <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100 text-sm text-gray-600">
                            <strong>Note:</strong> Services mentioned above are subject to availability of staff and resources.
                            Please contact the center worker at <span className="font-semibold text-gray-900">{linkedAnganwadi.contactNumber || "the center"}</span> for confirming specific requirements.
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

// Sub-component for Guidance List
const GuidanceList = () => {
    const [guidance, setGuidance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuidance = async () => {
            try {
                const { data } = await api.get('/anganwadi/guidance-for-mom');
                setGuidance(data);
            } catch (error) {
                console.error("Failed to fetch guidance");
            } finally {
                setLoading(false);
            }
        };
        fetchGuidance();
    }, []);

    if (loading) return <div className="text-center py-8 text-gray-400">Loading updates...</div>;

    if (guidance.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No recent announcements from your center.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {guidance.map((item) => (
                <GlassCard key={item._id} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    {item.type === 'announcement' && (
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
                            <AlertCircle size={12} /> Announcement
                        </div>
                    )}
                </GlassCard>
            ))}
        </div>
    );
};


export default AnganwadiPage;
